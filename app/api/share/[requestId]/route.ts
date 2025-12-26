import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { copyFolder, copyDeck, copyExam } from "@/lib/share-utils";
import { logActivity } from "@/lib/activity-logger";

// PATCH /api/share/[requestId] - Accept, reject, or cancel a share request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;
    const body = await request.json();
    const { action } = body; // 'accept', 'reject', or 'cancel'

    if (!["accept", "reject", "cancel"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Fetch the share request
    const shareRequest = await prisma.shareRequest.findUnique({
      where: { id: requestId },
      include: {
        Sender: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        Recipient: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!shareRequest) {
      return NextResponse.json({ error: "Share request not found" }, { status: 404 });
    }

    // Validate user permissions
    if (action === "cancel") {
      // Only sender can cancel
      if (shareRequest.senderId !== user.id) {
        return NextResponse.json({ error: "Only the sender can cancel this request" }, { status: 403 });
      }
    } else {
      // Only recipient can accept/reject
      if (shareRequest.recipientId !== user.id) {
        return NextResponse.json({ error: "Only the recipient can accept or reject this request" }, { status: 403 });
      }
    }

    // Check if request is already handled
    if (shareRequest.status !== "pending") {
      return NextResponse.json(
        { error: `This request has already been ${shareRequest.status}` },
        { status: 400 }
      );
    }

    // Handle cancel action
    if (action === "cancel") {
      await prisma.shareRequest.update({
        where: { id: requestId },
        data: {
          status: "cancelled",
          respondedAt: new Date(),
        },
      });

      // Mark notification as dismissed
      await prisma.shareNotification.updateMany({
        where: { shareRequestId: requestId },
        data: { dismissed: true },
      });

      return NextResponse.json({ success: true, message: "Share request cancelled" });
    }

    // Handle reject action
    if (action === "reject") {
      await prisma.shareRequest.update({
        where: { id: requestId },
        data: {
          status: "rejected",
          respondedAt: new Date(),
        },
      });

      // Create notification for sender
      await prisma.shareNotification.create({
        data: {
          userId: shareRequest.senderId,
          shareRequestId: requestId,
          type: "share_rejected",
          title: "Share request rejected",
          message: `${shareRequest.Recipient?.email || shareRequest.recipientEmail} rejected your "${shareRequest.contentName}" share`,
        },
      });

      // Mark incoming notification as dismissed
      await prisma.shareNotification.updateMany({
        where: {
          shareRequestId: requestId,
          type: "incoming_share",
        },
        data: { dismissed: true },
      });

      return NextResponse.json({ success: true, message: "Share request rejected" });
    }

    // Handle accept action - deep copy the content
    if (action === "accept") {
      try {
        let copiedContent;
        let contentType = shareRequest.contentType;

        switch (contentType) {
          case "folder":
            copiedContent = await copyFolder(
              shareRequest.contentId,
              user.id,
              shareRequest.Sender.email
            );
            break;

          case "deck":
            copiedContent = await copyDeck(
              shareRequest.contentId,
              user.id,
              shareRequest.Sender.email
            );
            break;

          case "exam":
            copiedContent = await copyExam(
              shareRequest.contentId,
              user.id,
              shareRequest.Sender.email
            );
            break;

          default:
            throw new Error("Invalid content type");
        }

        // Update share request status
        await prisma.shareRequest.update({
          where: { id: requestId },
          data: {
            status: "accepted",
            respondedAt: new Date(),
          },
        });

        // Create notification for sender
        await prisma.shareNotification.create({
          data: {
            userId: shareRequest.senderId,
            shareRequestId: requestId,
            type: "share_accepted",
            title: "Share request accepted",
            message: `${shareRequest.Recipient?.email || shareRequest.recipientEmail} accepted your "${shareRequest.contentName}" share`,
          },
        });

        // Mark incoming notification as dismissed
        await prisma.shareNotification.updateMany({
          where: {
            shareRequestId: requestId,
            type: "incoming_share",
          },
          data: { dismissed: true },
        });

        // Log activity for both sender and recipient
        await logActivity({
          userId: user.id,
          type: `${contentType}_received`,
          entityType: contentType,
          entityId: copiedContent.id,
          title: copiedContent.name,
          metadata: {
            from: shareRequest.Sender.email,
            originalName: shareRequest.contentName,
            itemCount: shareRequest.itemCount,
          },
        });

        await logActivity({
          userId: shareRequest.senderId,
          type: `${contentType}_shared`,
          entityType: contentType,
          entityId: shareRequest.contentId,
          title: shareRequest.contentName,
          metadata: {
            to: shareRequest.Recipient?.email || shareRequest.recipientEmail,
            itemCount: shareRequest.itemCount,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Share request accepted and content copied",
          content: copiedContent,
        });
      } catch (error) {
        console.error("Error copying content:", error);
        return NextResponse.json(
          { error: "Failed to copy content. The share request remains pending." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error handling share request:", error);
    return NextResponse.json({ error: "Failed to process share request" }, { status: 500 });
  }
}

// DELETE /api/share/[requestId] - Delete a share request (for cleanup)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await params;

    const shareRequest = await prisma.shareRequest.findUnique({
      where: { id: requestId },
    });

    if (!shareRequest) {
      return NextResponse.json({ error: "Share request not found" }, { status: 404 });
    }

    // Only sender or recipient can delete
    if (shareRequest.senderId !== user.id && shareRequest.recipientId !== user.id) {
      return NextResponse.json({ error: "You don't have permission to delete this request" }, { status: 403 });
    }

    // Delete related notifications
    await prisma.shareNotification.deleteMany({
      where: { shareRequestId: requestId },
    });

    // Delete the share request
    await prisma.shareRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ success: true, message: "Share request deleted" });
  } catch (error) {
    console.error("Error deleting share request:", error);
    return NextResponse.json({ error: "Failed to delete share request" }, { status: 500 });
  }
}
