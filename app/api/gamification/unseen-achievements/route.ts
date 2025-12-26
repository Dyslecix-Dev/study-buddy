import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS } from "@/lib/gamification";

/**
 * GET endpoint to fetch all unseen achievements for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch unseen achievements
    const unseenAchievements = await prisma.userAchievement.findMany({
      where: {
        userId: user.id,
        seen: false,
      },
      include: {
        Achievement: true,
      },
      orderBy: {
        unlockedAt: 'asc', // Show oldest unlocks first
      },
    });

    // Map to achievement definitions with XP
    const achievementsWithDetails = unseenAchievements.map(ua => {
      const achievementDef = ACHIEVEMENTS.find(a => a.key === ua.Achievement.key);
      return {
        id: ua.id,
        achievement: achievementDef,
        xpGained: ua.Achievement.xpReward,
        unlockedAt: ua.unlockedAt,
      };
    }).filter(a => a.achievement !== undefined); // Filter out any achievements that no longer exist

    return NextResponse.json({ achievements: achievementsWithDetails });
  } catch (error) {
    console.error("Error fetching unseen achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch unseen achievements" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to mark achievements as seen
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { achievementIds } = await request.json();

    if (!Array.isArray(achievementIds)) {
      return NextResponse.json(
        { error: "achievementIds must be an array" },
        { status: 400 }
      );
    }

    // Mark achievements as seen
    await prisma.userAchievement.updateMany({
      where: {
        id: { in: achievementIds },
        userId: user.id, // Ensure user can only mark their own achievements
      },
      data: {
        seen: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking achievements as seen:", error);
    return NextResponse.json(
      { error: "Failed to mark achievements as seen" },
      { status: 500 }
    );
  }
}
