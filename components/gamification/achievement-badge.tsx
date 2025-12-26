'use client';

import { AchievementDefinition, getAchievementTierClass } from '@/lib/gamification';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: AchievementDefinition;
  unlocked: boolean;
  unlockedAt?: Date;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
  className = '',
  size = 'md'
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  return (
    <Card
      className={cn(
        'relative transition-all duration-300',
        sizeClasses[size],
        unlocked
          ? 'hover:shadow-lg cursor-pointer'
          : 'opacity-50 grayscale',
        className
      )}
    >
      {!unlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-2">
        <div className={iconSizes[size]}>
          {achievement.icon}
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-sm">{achievement.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {achievement.description}
          </p>
        </div>

        <div className={cn(
          'px-2 py-1 rounded-full text-xs font-medium border',
          getAchievementTierClass(achievement.tier)
        )}>
          {achievement.tier.toUpperCase()}
        </div>

        {unlocked && unlockedAt && (
          <p className="text-xs text-muted-foreground">
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}

        {!unlocked && achievement.requirement && (
          <p className="text-xs text-muted-foreground">
            Requires: {achievement.requirement}
          </p>
        )}
      </div>
    </Card>
  );
}
