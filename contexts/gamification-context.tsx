'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AchievementDefinition } from '@/lib/gamification';
import AchievementUnlockModal from '@/components/gamification/achievement-unlock-modal';
import LevelUpModal from '@/components/gamification/level-up-modal';

interface AchievementNotification {
  achievement: AchievementDefinition;
  xpGained: number;
}

interface LevelUpNotification {
  oldLevel: number;
  newLevel: number;
}

interface GamificationContextType {
  showAchievementUnlock: (achievement: AchievementDefinition, xpGained: number) => void;
  showLevelUp: (oldLevel: number, newLevel: number) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [achievementQueue, setAchievementQueue] = useState<AchievementNotification[]>([]);
  const [levelUpQueue, setLevelUpQueue] = useState<LevelUpNotification[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementNotification | null>(null);
  const [currentLevelUp, setCurrentLevelUp] = useState<LevelUpNotification | null>(null);

  // Show next item in queue
  const showNextNotification = useCallback(() => {
    // Priority: Show level-up first, then achievements
    if (levelUpQueue.length > 0 && !currentLevelUp && !currentAchievement) {
      const [nextLevelUp, ...rest] = levelUpQueue;
      setCurrentLevelUp(nextLevelUp);
      setLevelUpQueue(rest);
    } else if (achievementQueue.length > 0 && !currentAchievement && !currentLevelUp) {
      const [nextAchievement, ...rest] = achievementQueue;
      setCurrentAchievement(nextAchievement);
      setAchievementQueue(rest);
    }
  }, [achievementQueue, levelUpQueue, currentAchievement, currentLevelUp]);

  const showAchievementUnlock = useCallback((achievement: AchievementDefinition, xpGained: number) => {
    setAchievementQueue(prev => [...prev, { achievement, xpGained }]);
  }, []);

  const showLevelUp = useCallback((oldLevel: number, newLevel: number) => {
    setLevelUpQueue(prev => [...prev, { oldLevel, newLevel }]);
  }, []);

  const handleAchievementClose = useCallback(() => {
    setCurrentAchievement(null);
    // Wait a bit before showing next notification
    setTimeout(showNextNotification, 300);
  }, [showNextNotification]);

  const handleLevelUpClose = useCallback(() => {
    setCurrentLevelUp(null);
    // Wait a bit before showing next notification
    setTimeout(showNextNotification, 300);
  }, [showNextNotification]);

  // Auto-show next notification when queue changes
  useEffect(() => {
    if (!currentAchievement && !currentLevelUp && (achievementQueue.length > 0 || levelUpQueue.length > 0)) {
      const timer = setTimeout(() => {
        showNextNotification();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [achievementQueue, levelUpQueue, currentAchievement, currentLevelUp, showNextNotification]);

  return (
    <GamificationContext.Provider value={{ showAchievementUnlock, showLevelUp }}>
      {children}
      <AchievementUnlockModal
        isOpen={currentAchievement !== null}
        onClose={handleAchievementClose}
        achievement={currentAchievement?.achievement || null}
        xpGained={currentAchievement?.xpGained || 0}
      />
      <LevelUpModal
        isOpen={currentLevelUp !== null}
        onClose={handleLevelUpClose}
        oldLevel={currentLevelUp?.oldLevel || 1}
        newLevel={currentLevelUp?.newLevel || 1}
      />
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
