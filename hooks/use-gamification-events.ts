'use client';

import { useCallback } from 'react';
import { useGamification } from '@/contexts/gamification-context';
import { AchievementDefinition } from '@/lib/gamification';

export interface GamificationEventResult {
  xpGained: number;
  achievementsUnlocked: AchievementDefinition[];
  leveledUp: boolean;
  newLevel?: number;
  oldLevel?: number;
}

/**
 * Hook to handle gamification events from API responses
 * This automatically shows modals when achievements are unlocked or level-ups occur
 */
export function useGamificationEvents() {
  const { showAchievementUnlock, showLevelUp } = useGamification();

  const handleGamificationResult = useCallback((result: GamificationEventResult) => {
    // Show achievement modals first
    if (result.achievementsUnlocked && result.achievementsUnlocked.length > 0) {
      result.achievementsUnlocked.forEach((achievement) => {
        showAchievementUnlock(achievement, achievement.xpReward);
      });
    }

    // Then show level-up modal if applicable
    if (result.leveledUp && result.oldLevel && result.newLevel) {
      showLevelUp(result.oldLevel, result.newLevel);
    }
  }, [showAchievementUnlock, showLevelUp]);

  return { handleGamificationResult };
}
