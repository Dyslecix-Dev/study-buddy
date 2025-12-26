import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/gamification';

/**
 * POST /api/gamification/xp
 * Award XP to the user
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
    const { xp, action } = body;

    if (typeof xp !== 'number' || xp <= 0) {
      return NextResponse.json({ error: 'Invalid XP value' }, { status: 400 });
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

    const oldLevel = userProgress.level;
    const newTotalXP = userProgress.totalXP + xp;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    // Update user progress
    const updatedProgress = await prisma.userProgress.update({
      where: { userId: user.id },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
      },
    });

    return NextResponse.json({
      success: true,
      xpGained: xp,
      totalXP: newTotalXP,
      level: newLevel,
      leveledUp,
      oldLevel,
      action,
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    return NextResponse.json(
      { error: 'Failed to award XP' },
      { status: 500 }
    );
  }
}
