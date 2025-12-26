'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AchievementDefinition } from '@/lib/gamification';
import { cn } from '@/lib/utils';

interface BadgeImageProps {
  achievement: AchievementDefinition;
  size?: number;
  unlocked?: boolean;
  className?: string;
}

/**
 * Badge Image Component with Fallback
 *
 * Attempts to load a custom badge image from /public/badges/{key}.png
 * Falls back to emoji if image doesn't exist or fails to load
 */
export function BadgeImage({
  achievement,
  size = 64,
  unlocked = true,
  className
}: BadgeImageProps) {
  const [imageError, setImageError] = useState(false);
  const badgePath = `/badges/${achievement.key}.png`;

  // Fallback to emoji if image fails to load or is locked
  if (imageError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          !unlocked && 'opacity-30 grayscale',
          className
        )}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.55
        }}
        aria-label={achievement.name}
      >
        {achievement.icon}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <Image
        src={badgePath}
        alt={achievement.name}
        width={size}
        height={size}
        className={cn(
          'rounded-full object-cover',
          !unlocked && 'opacity-30 grayscale'
        )}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
}
