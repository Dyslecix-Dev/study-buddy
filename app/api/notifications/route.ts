import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/notifications - Get all notifications for the current user
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
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const undismissedOnly = searchParams.get("undismissedOnly") === "true";

    const where: any = { userId: user.id };

    if (unreadOnly) {
      where.read = false;
    }

    if (undismissedOnly) {
      where.dismissed = false;
    }

    const notifications = await prisma.shareNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to 50 most recent
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark notifications as read or dismissed
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, action } = body; // action: 'read' or 'dismiss'

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: "Notification IDs are required" }, { status: 400 });
    }

    if (!["read", "dismiss"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updateData = action === "read" ? { read: true } : { dismissed: true };

    await prisma.shareNotification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: user.id, // Ensure user owns these notifications
      },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
