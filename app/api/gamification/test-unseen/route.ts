import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Debug endpoint to check unseen achievements
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        error: "Unauthorized",
        authError: authError?.message,
        user: null
      }, { status: 401 });
    }

    // Fetch ALL achievements for this user
    const allAchievements = await prisma.userAchievement.findMany({
      where: {
        userId: user.id,
      },
      include: {
        Achievement: true,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
    });

    // Fetch UNSEEN achievements
    const unseenAchievements = await prisma.userAchievement.findMany({
      where: {
        userId: user.id,
        seen: false,
      },
      include: {
        Achievement: true,
      },
      orderBy: {
        unlockedAt: 'asc',
      },
    });

    return NextResponse.json({
      userId: user.id,
      totalAchievements: allAchievements.length,
      unseenCount: unseenAchievements.length,
      allAchievements: allAchievements.map(a => ({
        key: a.Achievement.key,
        name: a.Achievement.name,
        unlockedAt: a.unlockedAt,
        seen: a.seen,
      })),
      unseenAchievements: unseenAchievements.map(a => ({
        key: a.Achievement.key,
        name: a.Achievement.name,
        unlockedAt: a.unlockedAt,
        seen: a.seen,
      })),
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return NextResponse.json(
      { error: "Internal error", details: String(error) },
      { status: 500 }
    );
  }
}
