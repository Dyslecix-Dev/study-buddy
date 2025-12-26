'use client';

import { calculateLevel } from '@/lib/gamification';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  totalXP: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelBadge({ totalXP, size = 'md', className }: LevelBadgeProps) {
  const level = calculateLevel(totalXP);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full',
        'bg-gradient-to-br from-yellow-400 to-orange-500',
        'shadow-lg border-2 border-yellow-300',
        sizeClasses[size],
        className
      )}
    >
      <div className="absolute -top-1 -right-1">
        <Trophy className={cn('text-yellow-200', iconSizes[size])} />
      </div>
      <span className="font-bold text-white">{level}</span>
    </div>
  );
}
