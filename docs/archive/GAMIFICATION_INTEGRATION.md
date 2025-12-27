# Gamification System Integration Guide

This guide explains how to integrate the gamification system into your Study Buddy features.

## Overview

The gamification system includes:
- **XP (Experience Points)**: Awarded for completing actions
- **Levels**: Calculated from total XP
- **Achievements/Badges**: Unlocked based on milestones
- **Streaks**: Daily activity tracking

## Database Models

### UserProgress
Tracks user's XP, level, and streaks:
```prisma
model UserProgress {
  id              String   @id @default(uuid())
  userId          String   @unique
  totalXP         Int      @default(0)
  level           Int      @default(1)
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastActiveDate  DateTime @default(now())
}
```

### Achievement
Defines available achievements:
```prisma
model Achievement {
  key             String   @unique
  name            String
  description     String
  icon            String
  xpReward        Int
  category        String
  requirement     Int?
  tier            String   // bronze, silver, gold, platinum
}
```

### UserAchievement
Tracks unlocked achievements per user:
```prisma
model UserAchievement {
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())
}
```

## Integration Examples

### 1. Award XP for Actions

Use the `awardXP` function from `gamification-service.ts`:

```typescript
import { awardXP } from '@/lib/gamification-service';
import { XP_VALUES } from '@/lib/gamification';

// Example: After creating a note
const result = await awardXP(userId, XP_VALUES.CREATE_NOTE, 'creating a note');

// Show toast notification
if (result.xpGained > 0) {
  showXPGainToast(result.xpGained, 'creating a note');
}

if (result.leveledUp) {
  toast.success(`Level up! You're now level ${result.newLevel}!`);
}
```

### 2. Check Count-Based Achievements

After actions that contribute to counts:

```typescript
import { checkCountAchievements, getUserCounts } from '@/lib/gamification-service';

// After creating a note
const counts = await getUserCounts(userId);
const achievements = await checkCountAchievements(userId, 'notes', counts.notes);

// Show achievement toasts
achievements.forEach(achievement => {
  showAchievementToast({ achievement, xpGained: achievement.xpReward });
});
```

### 3. Update Streaks

Call this on daily login or first action of the day:

```typescript
import { updateStreak } from '@/lib/gamification-service';

const { currentStreak, achievements } = await updateStreak(userId);

// Award daily login XP
await awardXP(userId, XP_VALUES.DAILY_LOGIN, 'daily login');

// Show streak achievements
achievements.forEach(achievement => {
  showAchievementToast({ achievement, xpGained: achievement.xpReward });
});
```

### 4. Check Specific Achievements

For special conditions (like perfect exam score):

```typescript
import { checkAndUnlockAchievement } from '@/lib/gamification-service';

// After completing an exam with 100% score
if (score === 100) {
  const result = await checkAndUnlockAchievement(userId, 'perfect-exam');

  if (result.unlocked && result.achievement) {
    showAchievementToast({
      achievement: result.achievement,
      xpGained: result.xpGained || 0
    });
  }
}
```

## XP Values

Available XP rewards (from `XP_VALUES` in `gamification.ts`):

```typescript
// Notes
CREATE_NOTE: 5
UPDATE_NOTE: 2

// Tasks
CREATE_TASK: 3
COMPLETE_TASK: 10

// Flashcards
CREATE_FLASHCARD: 2
REVIEW_FLASHCARD: 2
REVIEW_FLASHCARD_CORRECT: 3
CREATE_DECK: 5

// Study Sessions
STUDY_SESSION_15MIN: 10
STUDY_SESSION_25MIN: 15
STUDY_SESSION_45MIN: 25
STUDY_SESSION_60MIN: 35

// Exams
CREATE_EXAM: 8
COMPLETE_EXAM: 20
PERFECT_EXAM: 50

// Streaks
DAILY_LOGIN: 5
WEEK_STREAK: 50
MONTH_STREAK: 200

// Other
CREATE_FOLDER: 3
TAG_ITEM: 1
```

## UI Components

### Display XP Bar

```typescript
import { XPBar } from '@/components/gamification/xp-bar';

<XPBar totalXP={userProgress.totalXP} showDetails />
```

### Display Level Badge

```typescript
import { LevelBadge } from '@/components/gamification/level-badge';

<LevelBadge totalXP={userProgress.totalXP} size="md" />
```

### Display Achievement Badge

```typescript
import { AchievementBadge } from '@/components/gamification/achievement-badge';
import { ACHIEVEMENTS } from '@/lib/gamification';

const achievement = ACHIEVEMENTS.find(a => a.key === 'first-note');

<AchievementBadge
  achievement={achievement}
  unlocked={true}
  unlockedAt={new Date()}
  size="md"
/>
```

### Display Badge Collection

```typescript
import { BadgeCollection } from '@/components/gamification/badge-collection';

<BadgeCollection
  allAchievements={ACHIEVEMENTS}
  userAchievements={userAchievements}
/>
```

### Show Toasts

```typescript
import { showAchievementToast, showXPGainToast } from '@/components/gamification/achievement-toast';

// Show XP gain
showXPGainToast(10, 'completing a task');

// Show achievement unlock
showAchievementToast({
  achievement: achievementDef,
  xpGained: 100
});
```

## API Endpoints

### GET /api/gamification/progress
Get user's progress and achievements:
```typescript
const response = await fetch('/api/gamification/progress');
const { progress, achievements } = await response.json();
```

### POST /api/gamification/xp
Award XP to user:
```typescript
const response = await fetch('/api/gamification/xp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ xp: 10, action: 'completing task' }),
});
const { success, totalXP, level, leveledUp } = await response.json();
```

### GET /api/gamification/achievements
Get all achievements:
```typescript
const response = await fetch('/api/gamification/achievements');
const { allAchievements, userAchievements } = await response.json();
```

### POST /api/gamification/achievements
Unlock achievement:
```typescript
const response = await fetch('/api/gamification/achievements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ achievementKey: 'first-note' }),
});
const { success, achievement, xpGained } = await response.json();
```

## Integration Checklist

For each feature, consider:

1. **Award XP** when user completes an action
2. **Check achievements** if the action contributes to a count or milestone
3. **Update streaks** on first daily action
4. **Show feedback** using toast notifications
5. **Display progress** in relevant UI areas

## Example: Complete Task Integration

```typescript
// In your task completion API route or server action
async function completeTask(taskId: string, userId: string) {
  // Complete the task
  await prisma.task.update({
    where: { id: taskId },
    data: { completed: true },
  });

  // Award XP
  const xpResult = await awardXP(userId, XP_VALUES.COMPLETE_TASK, 'completing a task');

  // Get updated counts
  const counts = await getUserCounts(userId);

  // Check task achievements
  const achievements = await checkCountAchievements(userId, 'tasks', counts.tasksCompleted);

  // Update streak
  const streakResult = await updateStreak(userId);

  return {
    success: true,
    xp: xpResult,
    achievements: [...achievements, ...streakResult.achievements],
    streak: streakResult.currentStreak,
  };
}

// In your client component
const handleCompleteTask = async (taskId: string) => {
  const result = await completeTask(taskId);

  // Show XP toast
  if (result.xp.xpGained > 0) {
    showXPGainToast(result.xp.xpGained, 'completing a task');
  }

  // Show level up
  if (result.xp.leveledUp) {
    toast.success(`🎉 Level Up! You're now level ${result.xp.newLevel}!`);
  }

  // Show achievements
  result.achievements.forEach(achievement => {
    showAchievementToast({ achievement, xpGained: achievement.xpReward });
  });
};
```

## Best Practices

1. **Always await** gamification functions to ensure data consistency
2. **Batch checks** when possible (e.g., check multiple achievements together)
3. **Handle errors gracefully** - gamification should enhance UX, not break features
4. **Show immediate feedback** with toast notifications
5. **Don't spam** - group related achievements and XP gains when appropriate
6. **Update UI** after gamification events (refresh progress bars, etc.)

## Testing

When testing gamification:

1. Verify XP is awarded correctly
2. Check achievement unlock conditions
3. Test streak logic (consecutive days, streak breaks)
4. Ensure level calculations are accurate
5. Test UI components render correctly
6. Verify database transactions complete properly
