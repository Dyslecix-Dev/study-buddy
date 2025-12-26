import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { incrementDailyProgress } from "@/lib/progress-tracker";
import { logFocusSession } from "@/lib/activity-logger";
import { awardXP, checkAndUnlockAchievement } from "@/lib/gamification-service";
import { XP_VALUES } from "@/lib/gamification";
import { checkActionBasedAchievements, checkCompoundAchievements } from "@/lib/achievement-helpers";

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

    // Gamification: Award XP based on duration
    try {
      const minutes = session.duration;
      let xpAmount = 0;

      if (minutes >= 60) xpAmount = XP_VALUES.STUDY_SESSION_60MIN;
      else if (minutes >= 45) xpAmount = XP_VALUES.STUDY_SESSION_45MIN;
      else if (minutes >= 25) xpAmount = XP_VALUES.STUDY_SESSION_25MIN;
      else if (minutes >= 15) xpAmount = XP_VALUES.STUDY_SESSION_15MIN;

      if (xpAmount > 0) {
        await awardXP(user.id, xpAmount);
      }

      // Check time-based achievements
      const hour = new Date().getHours();

      // Night Owl: 11 PM - 11:59 PM
      if (hour === 23) {
        await checkAndUnlockAchievement(user.id, 'night-owl');
      }

      // Early Riser: 12 AM - 5:59 AM
      if (hour >= 0 && hour < 6) {
        await checkAndUnlockAchievement(user.id, 'early-riser');
      }

      // Check achievements
      await checkActionBasedAchievements(user.id);
      await checkCompoundAchievements(user.id);
    } catch (gamificationError) {
      console.error('Gamification error:', gamificationError);
    }

    // Log activity for recent activity feed
    await logFocusSession(user.id, session.id, mode, roundedDuration);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creating focus session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

