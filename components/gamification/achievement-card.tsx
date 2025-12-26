'use client';

import { AchievementDefinition, getAchievementTierClass } from '@/lib/gamification';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeImage } from './badge-image';

interface AchievementCardProps {
  achievement: AchievementDefinition;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: {
    current: number;
    required: number;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

/**
 * Achievement Card Component
 * Shows achievement with badge image, name, description, and unlock status
 */
export function AchievementCard({
  achievement,
  unlocked,
  unlockedAt,
  progress,
  className = '',
  size = 'md',
  onClick
}: AchievementCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const badgeSizes = {
    sm: 48,
    md: 64,
    lg: 80,
  };

  const showProgress = !unlocked && progress && achievement.requirement;
  const progressPercentage = showProgress
    ? Math.min(100, (progress.current / progress.required) * 100)
    : 0;

  return (
    <Card
      className={cn(
        'relative transition-all duration-300 overflow-hidden',
        sizeClasses[size],
        unlocked
          ? 'hover:shadow-lg cursor-pointer border-primary/20 bg-gradient-to-br from-background to-muted/20'
          : 'opacity-60 border-muted',
        onClick && 'hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      {/* Locked Overlay */}
      {!unlocked && (
        <div className="absolute top-2 right-2 z-10">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <CardContent className="p-0 flex flex-col items-center text-center space-y-3">
        {/* Badge Image */}
        <div className="relative">
          <BadgeImage
            achievement={achievement}
            size={badgeSizes[size]}
            unlocked={unlocked}
          />

          {/* Unlock Glow Effect */}
          {unlocked && (
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, ${getAchievementTierColor(achievement.tier)} 0%, transparent 70%)`,
                opacity: 0.2,
              }}
            />
          )}
        </div>

        {/* Achievement Info */}
        <div className="space-y-1 w-full">
          <h3 className={cn(
            'font-semibold',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}>
            {achievement.name}
          </h3>

          <p className={cn(
            'text-muted-foreground line-clamp-2',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-xs',
            size === 'lg' && 'text-sm'
          )}>
            {achievement.description}
          </p>
        </div>

        {/* Tier Badge */}
        <Badge className={cn(
          'text-xs font-medium',
          getAchievementTierClass(achievement.tier)
        )}>
          {achievement.tier.toUpperCase()}
        </Badge>

        {/* XP Reward */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
            +{achievement.xpReward} XP
          </span>
        </div>

        {/* Progress Bar (for locked achievements) */}
        {showProgress && (
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress.current} / {progress.required}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Unlocked Date */}
        {unlocked && unlockedAt && (
          <p className="text-xs text-muted-foreground">
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}

        {/* Locked Message */}
        {!unlocked && !showProgress && achievement.requirement && (
          <p className="text-xs text-muted-foreground">
            Required: {achievement.requirement}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function getAchievementTierColor(tier: string): string {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
  };
  return colors[tier as keyof typeof colors] || '#888888';
}
