'use client';

import { useState } from 'react';
import { AchievementDefinition, getAchievementsByCategory, sortAchievements, AchievementCategory } from '@/lib/gamification';
import { AchievementBadge } from './achievement-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
}

interface BadgeCollectionProps {
  allAchievements: AchievementDefinition[];
  userAchievements: UserAchievement[];
}

export function BadgeCollection({ allAchievements, userAchievements }: BadgeCollectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

  const getUnlockedDate = (achievementKey: string) => {
    const userAchievement = userAchievements.find(ua => {
      const achievement = allAchievements.find(a => a.key === achievementKey);
      return achievement?.key === achievementKey;
    });
    return userAchievement?.unlockedAt;
  };

  const categories: Array<{ value: AchievementCategory | 'all'; label: string; icon: string }> = [
    { value: 'all', label: 'All', icon: '🏆' },
    { value: 'notes', label: 'Notes', icon: '📝' },
    { value: 'tasks', label: 'Tasks', icon: '✅' },
    { value: 'flashcards', label: 'Flashcards', icon: '🃏' },
    { value: 'study', label: 'Study', icon: '📚' },
    { value: 'streak', label: 'Streaks', icon: '🔥' },
    { value: 'exams', label: 'Exams', icon: '📋' },
    { value: 'mastery', label: 'Mastery', icon: '⭐' },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? sortAchievements(allAchievements)
    : sortAchievements(getAchievementsByCategory(selectedCategory));

  const unlockedCount = filteredAchievements.filter(a =>
    unlockedIds.has(allAchievements.find(full => full.key === a.key)?.key || '')
  ).length;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Achievement Collection
          </h2>
          <div className="text-sm text-muted-foreground">
            {userAchievements.length} / {allAchievements.length} unlocked
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AchievementCategory | 'all')}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
            {categories.map(cat => (
              <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.value} value={cat.value} className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{filteredAchievements.length} achievements</span>
                <span>{unlockedCount} unlocked</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAchievements.map(achievement => {
                  const fullAchievement = allAchievements.find(a => a.key === achievement.key);
                  const achievementId = fullAchievement?.key || '';
                  const unlocked = unlockedIds.has(achievementId);

                  return (
                    <AchievementBadge
                      key={achievement.key}
                      achievement={achievement}
                      unlocked={unlocked}
                      unlockedAt={unlocked ? getUnlockedDate(achievement.key) : undefined}
                      size="sm"
                    />
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
