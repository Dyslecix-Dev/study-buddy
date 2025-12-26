'use client';

import { getXPProgress } from '@/lib/gamification';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap } from 'lucide-react';

interface XPBarProps {
  totalXP: number;
  className?: string;
  showDetails?: boolean;
}

export function XPBar({ totalXP, className = '', showDetails = true }: XPBarProps) {
  const { currentLevel, progressXP, nextLevelXP, currentLevelXP, progressPercentage } = getXPProgress(totalXP);
  const requiredXP = nextLevelXP - currentLevelXP;

  return (
    <div className={`space-y-2 ${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">Level {currentLevel}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Zap className="h-3 w-3" />
            <span>
              {progressXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
            </span>
          </div>
        </div>
      )}

      <Progress value={progressPercentage} className="h-2" />

      {showDetails && (
        <p className="text-xs text-muted-foreground text-right">
          {requiredXP - progressXP} XP to level {currentLevel + 1}
        </p>
      )}
    </div>
  );
}
