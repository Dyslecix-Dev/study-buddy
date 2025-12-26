'use client';

import { useUnseenAchievements } from '@/hooks/use-unseen-achievements';

/**
 * Component that checks for unseen achievements on mount
 * This should be placed in the root layout to ensure it runs
 * when users log in and haven't seen their achievement modals yet
 */
export function UnseenAchievementsChecker() {
  useUnseenAchievements();
  return null; // This component doesn't render anything
}
