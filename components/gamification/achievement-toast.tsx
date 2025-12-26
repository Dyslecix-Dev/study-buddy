'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { AchievementDefinition } from '@/lib/gamification';
import { Trophy, Sparkles } from 'lucide-react';

interface AchievementToastProps {
  achievement: AchievementDefinition;
  xpGained: number;
}

export function showAchievementToast({ achievement, xpGained }: AchievementToastProps) {
  toast.custom(
    (t) => (
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{achievement.icon}</div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <h3 className="font-bold text-sm">Achievement Unlocked!</h3>
            </div>

            <p className="font-semibold">{achievement.name}</p>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>

            <div className="flex items-center gap-2 mt-2">
              <Sparkles className="h-3 w-3 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                +{xpGained} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: 'top-center',
    }
  );
}

export function showXPGainToast(xp: number, action: string) {
  toast.success(
    <div className="flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-yellow-500" />
      <span>
        <span className="font-semibold">+{xp} XP</span> for {action}
      </span>
    </div>,
    {
      duration: 2000,
    }
  );
}
