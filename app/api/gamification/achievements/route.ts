import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { ACHIEVEMENTS } from '@/lib/gamification';

/**
 * GET /api/gamification/achievements
 * Get all achievements and user's unlocked achievements
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

    // Get all achievements from database
    const dbAchievements = await prisma.achievement.findMany();

    // Sync achievements from code to database if needed
    if (dbAchievements.length === 0) {
      await prisma.achievement.createMany({
        data: ACHIEVEMENTS.map(a => ({
          key: a.key,
          name: a.name,
          description: a.description,
          icon: a.icon,
          xpReward: a.xpReward,
          category: a.category,
          requirement: a.requirement,
          tier: a.tier,
        })),
      });
    }

    // Get user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: {
        Achievement: true,
      },
    });

    return NextResponse.json({
      allAchievements: ACHIEVEMENTS,
      userAchievements,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/achievements
 * Unlock an achievement for the user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { achievementKey } = body;

    if (!achievementKey) {
      return NextResponse.json({ error: 'Achievement key required' }, { status: 400 });
    }

    // Find achievement in database
    let achievement = await prisma.achievement.findUnique({
      where: { key: achievementKey },
    });

    // Create achievement if it doesn't exist
    if (!achievement) {
      const achievementDef = ACHIEVEMENTS.find(a => a.key === achievementKey);
      if (!achievementDef) {
        return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
      }

      achievement = await prisma.achievement.create({
        data: {
          key: achievementDef.key,
          name: achievementDef.name,
          description: achievementDef.description,
          icon: achievementDef.icon,
          xpReward: achievementDef.xpReward,
          category: achievementDef.category,
          requirement: achievementDef.requirement,
          tier: achievementDef.tier,
        },
      });
    }

    // Check if user already has this achievement
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: user.id,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Achievement already unlocked',
      });
    }

    // Unlock achievement
    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId: user.id,
        achievementId: achievement.id,
      },
      include: {
        Achievement: true,
      },
    });

    // Award XP
    await prisma.userProgress.upsert({
      where: { userId: user.id },
      update: {
        totalXP: { increment: achievement.xpReward },
      },
      create: {
        userId: user.id,
        totalXP: achievement.xpReward,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      achievement: userAchievement,
      xpGained: achievement.xpReward,
    });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    );
  }
}
