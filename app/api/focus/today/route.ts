import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get start of today in UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all sessions from today
    const sessions = await prisma.focusSession.findMany({
      where: {
        userId: user.id,
        completedAt: {
          gte: today,
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // Calculate total minutes for work sessions only
    const totalMinutes = sessions.filter((s) => s.mode === "work").reduce((sum, session) => sum + session.duration, 0);

    // Count work sessions
    const sessionCount = sessions.filter((s) => s.mode === "work").length;

    return NextResponse.json({
      totalMinutes,
      sessionCount,
      recentSessions: sessions.slice(0, 10),
    });
  } catch (error) {
    console.error("Error fetching today's focus stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

