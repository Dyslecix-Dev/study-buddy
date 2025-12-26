/**
 * Gamification Service
 * Helper functions to integrate gamification into existing features
 */

import { prisma } from "@/lib/prisma";
import { calculateLevel, ACHIEVEMENTS, AchievementDefinition } from "./gamification";

export interface GamificationResult {
  xpGained: number;
  achievementsUnlocked: AchievementDefinition[];
  leveledUp: boolean;
  newLevel?: number;
  oldLevel?: number;
}

/**
 * Award XP to a user and check for achievements
 */
export async function awardXP(userId: string, xp: number, action?: string): Promise<GamificationResult> {
  const result: GamificationResult = {
    xpGained: xp,
    achievementsUnlocked: [],
    leveledUp: false,
  };

  try {
    // Get or create user progress
    let userProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!userProgress) {
      userProgress = await prisma.userProgress.create({
        data: {
          userId,
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

    result.oldLevel = oldLevel;
    result.newLevel = newLevel;
    result.leveledUp = newLevel > oldLevel;

    // Update user progress
    await prisma.userProgress.update({
      where: { userId },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
        lastActiveDate: new Date(),
      },
    });

    return result;
  } catch (error) {
    console.error("Error awarding XP:", error);
    return result;
  }
}

/**
 * Check and unlock achievement if conditions are met
 */
export async function checkAndUnlockAchievement(userId: string, achievementKey: string): Promise<{ unlocked: boolean; achievement?: AchievementDefinition; xpGained?: number }> {
  try {
    // Find achievement definition
    const achievementDef = ACHIEVEMENTS.find((a) => a.key === achievementKey);
    if (!achievementDef) {
      return { unlocked: false };
    }

    // Find or create achievement in database
    let achievement = await prisma.achievement.findUnique({
      where: { key: achievementKey },
    });

    if (!achievement) {
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
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) {
      return { unlocked: false };
    }

    // Unlock achievement
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
    });

    // Award XP
    await awardXP(userId, achievement.xpReward, `Unlocked achievement: ${achievementDef.name}`);

    return {
      unlocked: true,
      achievement: achievementDef,
      xpGained: achievement.xpReward,
    };
  } catch (error) {
    console.error("Error checking achievement:", error);
    return { unlocked: false };
  }
}

/**
 * Check multiple count-based achievements
 */
export async function checkCountAchievements(userId: string, category: "notes" | "tasks" | "flashcards" | "study" | "exams", count: number): Promise<AchievementDefinition[]> {
  const unlockedAchievements: AchievementDefinition[] = [];

  // Filter achievements by category that have count requirements
  const categoryAchievements = ACHIEVEMENTS.filter((a) => a.category === category && a.requirement && count >= a.requirement);

  for (const achievement of categoryAchievements) {
    const result = await checkAndUnlockAchievement(userId, achievement.key);
    if (result.unlocked && result.achievement) {
      unlockedAchievements.push(result.achievement);
    }
  }

  return unlockedAchievements;
}

/**
 * Update streak and check streak achievements
 */
export async function updateStreak(userId: string): Promise<{ currentStreak: number; achievements: AchievementDefinition[] }> {
  const unlockedAchievements: AchievementDefinition[] = [];

  try {
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!userProgress) {
      return { currentStreak: 0, achievements: [] };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = new Date(userProgress.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    let currentStreak = userProgress.currentStreak;
    let longestStreak = userProgress.longestStreak;

    if (daysDiff === 0) {
      // Same day, no change
      return { currentStreak, achievements: [] };
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      // Streak broken, reset
      currentStreak = 1;
    }

    // Update progress
    await prisma.userProgress.update({
      where: { userId },
      data: {
        currentStreak,
        longestStreak,
        lastActiveDate: new Date(),
      },
    });

    // Check streak achievements
    const streakAchievements = ACHIEVEMENTS.filter((a) => a.category === "streak" && a.requirement && currentStreak >= a.requirement);

    for (const achievement of streakAchievements) {
      const result = await checkAndUnlockAchievement(userId, achievement.key);
      if (result.unlocked && result.achievement) {
        unlockedAchievements.push(result.achievement);
      }
    }

    return { currentStreak, achievements: unlockedAchievements };
  } catch (error) {
    console.error("Error updating streak:", error);
    return { currentStreak: 0, achievements: [] };
  }
}

/**
 * Get total count for achievement checking
 */
export async function getUserCounts(userId: string) {
  const [notesCount, tasksCompletedCount, cardsReviewedCount, examsCompletedCount, studyMinutes] = await Promise.all([
    prisma.note.count({ where: { userId } }),
    prisma.task.count({ where: { userId, completed: true } }),
    prisma.review.count({ where: { Flashcard: { Deck: { userId } } } }),
    prisma.examAttempt.count({ where: { userId, completedAt: { not: null } } }),
    prisma.focusSession.aggregate({
      where: { userId },
      _sum: { duration: true },
    }),
  ]);

  return {
    notes: notesCount,
    tasksCompleted: tasksCompletedCount,
    cardsReviewed: cardsReviewedCount,
    examsCompleted: examsCompletedCount,
    studyMinutes: studyMinutes._sum.duration || 0,
  };
}

