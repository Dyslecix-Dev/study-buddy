import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGamification } from '@/contexts/gamification-context';
import { AchievementDefinition } from '@/lib/gamification';

interface UnseenAchievement {
  id: string;
  achievement: AchievementDefinition;
  xpGained: number;
  unlockedAt: Date;
}

/**
 * Hook to check for unseen achievements on mount and show their modals
 * This ensures achievements unlocked during signup or other server-side actions
 * are displayed to the user when they next visit the app
 */
export function useUnseenAchievements() {
  const { showAchievementUnlock } = useGamification();
  const pathname = usePathname();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Don't check on auth pages (login, signup, reset-password)
    if (pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/auth')) {
      return;
    }

    // Only check once per mount
    if (hasChecked.current) return;
    hasChecked.current = true;

    async function checkUnseenAchievements() {
      try {
        console.log('[Unseen Achievements] Checking for unseen achievements...');
        const response = await fetch('/api/gamification/unseen-achievements');
        if (!response.ok) {
          console.error('[Unseen Achievements] Failed to fetch:', response.status, response.statusText);
          return;
        }

        const data = await response.json();
        const unseenAchievements: UnseenAchievement[] = data.achievements;

        console.log('[Unseen Achievements] Found:', unseenAchievements.length, unseenAchievements);

        if (unseenAchievements.length === 0) return;

        // Queue all unseen achievements to be shown
        unseenAchievements.forEach(({ achievement, xpGained }) => {
          console.log('[Unseen Achievements] Showing modal for:', achievement?.name);
          showAchievementUnlock(achievement, xpGained);
        });

        // Mark them as seen after a delay (to ensure modals have been queued)
        setTimeout(async () => {
          const achievementIds = unseenAchievements.map(a => a.id);
          console.log('[Unseen Achievements] Marking as seen:', achievementIds);
          await fetch('/api/gamification/unseen-achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ achievementIds }),
          });
        }, 1000);
      } catch (error) {
        console.error('[Unseen Achievements] Error:', error);
      }
    }

    checkUnseenAchievements();
  }, [showAchievementUnlock, pathname]);
}
