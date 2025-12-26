/**
 * Helper functions to collect and aggregate gamification results
 * Use these in API routes to return complete gamification data to clients
 */

import { GamificationResult } from "./gamification-service";
import { AchievementDefinition } from "./gamification";

/**
 * Creates an empty gamification result
 */
export function createGamificationResult(): GamificationResult {
  return {
    xpGained: 0,
    achievementsUnlocked: [],
    leveledUp: false,
  };
}

/**
 * Merges multiple gamification results into one
 * Useful when multiple actions award XP and unlock achievements
 */
export function mergeGamificationResults(...results: GamificationResult[]): GamificationResult {
  const merged: GamificationResult = {
    xpGained: 0,
    achievementsUnlocked: [],
    leveledUp: false,
  };

  for (const result of results) {
    merged.xpGained += result.xpGained;

    if (result.achievementsUnlocked && result.achievementsUnlocked.length > 0) {
      merged.achievementsUnlocked.push(...result.achievementsUnlocked);
    }

    // If any result caused a level up, use the latest level
    if (result.leveledUp) {
      merged.leveledUp = true;
      merged.oldLevel = result.oldLevel;
      merged.newLevel = result.newLevel;
    }
  }

  return merged;
}

/**
 * Adds achievements to a gamification result
 */
export function addAchievements(
  result: GamificationResult,
  achievements: AchievementDefinition[]
): GamificationResult {
  if (achievements.length > 0) {
    result.achievementsUnlocked = [
      ...(result.achievementsUnlocked || []),
      ...achievements,
    ];
  }
  return result;
}

/**
 * Wrapper to safely execute gamification logic without breaking main flow
 * Returns a result or empty result on error
 */
export async function safeGamification<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("Gamification error:", error);
    return fallback;
  }
}
