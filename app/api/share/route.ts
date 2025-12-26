import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// POST /api/share - Create share request(s)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientEmails, contentType, contentId } = body;

    if (!recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return NextResponse.json({ error: "At least one recipient email is required" }, { status: 400 });
    }

    if (!contentType || !["folder", "deck", "exam"].includes(contentType)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 });
    }

    // Fetch the content to validate ownership and get details
    let content: any;
    let itemCount = 0;
    let contentName = "";

    switch (contentType) {
      case "folder":
        content = await prisma.folder.findUnique({
          where: { id: contentId },
          include: {
            _count: {
              select: { Note: true },
            },
          },
        });
        if (!content) {
          return NextResponse.json({ error: "Folder not found" }, { status: 404 });
        }
        if (content.userId !== user.id) {
          return NextResponse.json({ error: "You do not own this folder" }, { status: 403 });
        }
        contentName = content.name;
        itemCount = content._count.Note;
        break;

      case "deck":
        content = await prisma.deck.findUnique({
          where: { id: contentId },
          include: {
            _count: {
              select: { Flashcard: true },
            },
          },
        });
        if (!content) {
          return NextResponse.json({ error: "Deck not found" }, { status: 404 });
        }
        if (content.userId !== user.id) {
          return NextResponse.json({ error: "You do not own this deck" }, { status: 403 });
        }
        contentName = content.name;
        itemCount = content._count.Flashcard;
        break;

      case "exam":
        content = await prisma.exam.findUnique({
          where: { id: contentId },
          include: {
            _count: {
              select: { Question: true },
            },
          },
        });
        if (!content) {
          return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }
        if (content.userId !== user.id) {
          return NextResponse.json({ error: "You do not own this exam" }, { status: 403 });
        }
        contentName = content.name;
        itemCount = content._count.Question;
        break;
    }

    const results = [];
    const errors = [];

    // Process each recipient email
    for (const recipientEmail of recipientEmails) {
      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
          errors.push({ email: recipientEmail, error: "Invalid email format" });
          continue;
        }

        // Check if recipient exists
        const recipient = await prisma.user.findUnique({
          where: { email: recipientEmail.toLowerCase() },
        });

        if (!recipient) {
          errors.push({ email: recipientEmail, error: "User not found" });
          continue;
        }

        // Prevent sharing with self
        if (recipient.id === user.id) {
          errors.push({ email: recipientEmail, error: "Cannot share with yourself" });
          continue;
        }

        // Check for existing pending share request
        const existingRequest = await prisma.shareRequest.findFirst({
          where: {
            senderId: user.id,
            recipientId: recipient.id,
            contentType,
            contentId,
            status: "pending",
          },
        });

        if (existingRequest) {
          errors.push({ email: recipientEmail, error: "Share request already pending" });
          continue;
        }

        // Create share request
        const shareRequest = await prisma.shareRequest.create({
          data: {
            senderId: user.id,
            recipientEmail: recipient.email,
            recipientId: recipient.id,
            contentType,
            contentId,
            contentName,
            itemCount,
            status: "pending",
          },
        });

        // Create notification for recipient
        await prisma.shareNotification.create({
          data: {
            userId: recipient.id,
            shareRequestId: shareRequest.id,
            type: "incoming_share",
            title: `New ${contentType} shared with you`,
            message: `${user.email} shared "${contentName}" with you`,
          },
        });

        results.push({ email: recipientEmail, success: true, requestId: shareRequest.id });
      } catch (error) {
        console.error(`Error sharing with ${recipientEmail}:`, error);
        errors.push({ email: recipientEmail, error: "Failed to create share request" });
      }
    }

    return NextResponse.json({ results, errors }, { status: 200 });
  } catch (error) {
    console.error("Error in share request:", error);
    return NextResponse.json({ error: "Failed to create share request" }, { status: 500 });
  }
}

// GET /api/share - Get all share requests (sent and received)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'sent' or 'received'

    let sent: any[] = [];
    let received: any[] = [];

    if (!type || type === "sent") {
      sent = await prisma.shareRequest.findMany({
        where: { senderId: user.id },
        include: {
          Recipient: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!type || type === "received") {
      received = await prisma.shareRequest.findMany({
        where: { recipientId: user.id },
        include: {
          Sender: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ sent, received });
  } catch (error) {
    console.error("Error fetching share requests:", error);
    return NextResponse.json({ error: "Failed to fetch share requests" }, { status: 500 });
  }
}
