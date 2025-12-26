'use client';

import { useState } from 'react';
import { ACHIEVEMENTS, getAchievementsByCategory, AchievementCategory, sortAchievements } from '@/lib/gamification';
import { AchievementCard } from '@/components/gamification/achievement-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star } from 'lucide-react';

interface UserAchievement {
  id: string;
  achievementId: string;
  unlockedAt: Date;
  Achievement: {
    key: string;
  };
}

interface UserProgress {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}

interface ProgressData {
  notes: number;
  folders: number;
  tasks: number;
  tasksCompleted: number;
  decks: number;
  cardsReviewed: number;
  exams: number;
  examsCompleted: number;
  questions: number;
  studyMinutes: number;
  studyHours: number;
  noteLinks: number;
  tagsUsed: number;
  bugReports: number;
  level: number;
  currentStreak: number;
}

interface AchievementsPageClientProps {
  userProgress: UserProgress | null;
  userAchievements: UserAchievement[];
  progressData: ProgressData;
}

export function AchievementsPageClient({
  userProgress,
  userAchievements,
  progressData,
}: AchievementsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const unlockedKeys = new Set(userAchievements.map(ua => ua.Achievement.key));

  const categories: Array<{ value: AchievementCategory | 'all'; label: string; icon: string }> = [
    { value: 'all', label: 'All', icon: '🏆' },
    { value: 'notes', label: 'Notes', icon: '📝' },
    { value: 'tasks', label: 'Tasks', icon: '✅' },
    { value: 'flashcards', label: 'Flashcards', icon: '🃏' },
    { value: 'study', label: 'Study', icon: '📚' },
    { value: 'streak', label: 'Streaks', icon: '🔥' },
    { value: 'exams', label: 'Exams', icon: '📋' },
    { value: 'mastery', label: 'Mastery', icon: '⭐' },
    { value: 'profile', label: 'Profile', icon: '👤' },
    { value: 'social', label: 'Social', icon: '🤝' },
    { value: 'special', label: 'Special', icon: '✨' },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? sortAchievements(ACHIEVEMENTS)
    : sortAchievements(getAchievementsByCategory(selectedCategory));

  const unlockedCount = filteredAchievements.filter(a => unlockedKeys.has(a.key)).length;
  const progressPercentage = Math.round((userAchievements.length / ACHIEVEMENTS.length) * 100);

  // Calculate progress for each achievement
  const getAchievementProgress = (achievementKey: string) => {
    const progressMap: Record<string, { current: number; required: number } | undefined> = {
      'first-note': { current: progressData.notes, required: 1 },
      'notes-10': { current: progressData.notes, required: 10 },
      'notes-50': { current: progressData.notes, required: 50 },
      'notes-100': { current: progressData.notes, required: 100 },
      'notes-500': { current: progressData.notes, required: 500 },

      'first-folder': { current: progressData.folders, required: 1 },
      'folder-master': { current: progressData.folders, required: 10 },

      'first-task': { current: progressData.tasks, required: 1 },
      'tasks-completed-10': { current: progressData.tasksCompleted, required: 10 },
      'tasks-completed-50': { current: progressData.tasksCompleted, required: 50 },
      'tasks-completed-100': { current: progressData.tasksCompleted, required: 100 },
      'tasks-completed-500': { current: progressData.tasksCompleted, required: 500 },

      'first-deck': { current: progressData.decks, required: 1 },
      'deck-collector': { current: progressData.decks, required: 10 },
      'cards-reviewed-100': { current: progressData.cardsReviewed, required: 100 },
      'cards-reviewed-500': { current: progressData.cardsReviewed, required: 500 },
      'cards-reviewed-1000': { current: progressData.cardsReviewed, required: 1000 },
      'cards-reviewed-5000': { current: progressData.cardsReviewed, required: 5000 },

      'first-study-session': { current: progressData.studyMinutes > 0 ? 1 : 0, required: 1 },
      'study-hours-10': { current: progressData.studyHours, required: 10 },
      'study-hours-50': { current: progressData.studyHours, required: 50 },
      'study-hours-100': { current: progressData.studyHours, required: 100 },
      'study-hours-500': { current: progressData.studyHours, required: 500 },

      'streak-3': { current: progressData.currentStreak, required: 3 },
      'streak-7': { current: progressData.currentStreak, required: 7 },
      'streak-30': { current: progressData.currentStreak, required: 30 },
      'streak-100': { current: progressData.currentStreak, required: 100 },
      'streak-365': { current: progressData.currentStreak, required: 365 },

      'first-exam': { current: progressData.exams, required: 1 },
      'exam-creator': { current: progressData.exams, required: 1 },
      'exams-completed-10': { current: progressData.examsCompleted, required: 10 },
      'exams-completed-50': { current: progressData.examsCompleted, required: 50 },

      'question-master': { current: progressData.questions, required: 50 },

      'first-link': { current: progressData.noteLinks, required: 1 },
      'first-tag': { current: progressData.tagsUsed, required: 1 },
      'tag-master': { current: progressData.tagsUsed, required: 50 },

      'bug-reporter': { current: progressData.bugReports, required: 1 },
      'quality-contributor': { current: progressData.bugReports, required: 5 },

      'level-10': { current: progressData.level, required: 10 },
      'level-25': { current: progressData.level, required: 25 },
      'level-50': { current: progressData.level, required: 50 },
      'level-100': { current: progressData.level, required: 100 },
    };

    return progressMap[achievementKey];
  };

  const getUnlockedDate = (achievementKey: string) => {
    const userAchievement = userAchievements.find(ua => ua.Achievement.key === achievementKey);
    return userAchievement?.unlockedAt;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Overall Progress</h2>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  Level {userProgress?.level || 1}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Achievements Unlocked</span>
                <span className="font-medium">
                  {userAchievements.length} / {ACHIEVEMENTS.length} ({progressPercentage}%)
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {userProgress?.totalXP || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userProgress?.currentStreak || 0}
                </p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userAchievements.filter(ua => {
                    const achievement = ACHIEVEMENTS.find(a => a.key === ua.Achievement.key);
                    return achievement?.tier === 'gold' || achievement?.tier === 'platinum';
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">Rare Badges</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round((userAchievements.length / ACHIEVEMENTS.length) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Completion</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AchievementCategory | 'all')}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-11 mb-6">
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
              <span className="mr-1">{cat.icon}</span>
              <span className="hidden md:inline">{cat.label}</span>
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
                const unlocked = unlockedKeys.has(achievement.key);
                const progress = getAchievementProgress(achievement.key);

                return (
                  <AchievementCard
                    key={achievement.key}
                    achievement={achievement}
                    unlocked={unlocked}
                    unlockedAt={unlocked ? getUnlockedDate(achievement.key) : undefined}
                    progress={progress}
                    size="sm"
                  />
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
