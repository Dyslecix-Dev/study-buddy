import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/gamification';

/**
 * GET /api/gamification/progress
 * Get user's gamification progress (XP, level, streaks)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user progress
    let userProgress = await prisma.userProgress.findUnique({
      where: { userId: user.id },
    });

    if (!userProgress) {
      userProgress = await prisma.userProgress.create({
        data: {
          userId: user.id,
          totalXP: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date(),
        },
      });
    }

    // Get user achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: {
        Achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    return NextResponse.json({
      progress: userProgress,
      achievements: userAchievements,
    });
  } catch (error) {
    console.error('Error fetching gamification progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
