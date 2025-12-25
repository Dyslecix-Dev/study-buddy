import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { incrementDailyProgress } from "@/lib/progress-tracker";
import { logFocusSession } from "@/lib/activity-logger";

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
    const { mode, duration } = body;

    if (!mode || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      },
    });

    const roundedDuration = Math.round(duration);

    const session = await prisma.focusSession.create({
      data: {
        userId: user.id,
        mode,
        duration: roundedDuration,
        completedAt: new Date(),
      },
    });

    // Track focus minutes in DailyProgress for permanent record
    await incrementDailyProgress(user.id, "focusSession", new Date(), roundedDuration);

    // Log activity for recent activity feed
    await logFocusSession(user.id, session.id, mode, roundedDuration);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creating focus session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

