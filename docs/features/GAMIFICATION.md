# Gamification

XP, levels (1-100), 60 achievements, badges.

## Quick Start

```typescript
import { checkAndAwardAchievements } from "@/lib/gamification-service";
import { logActivity } from "@/lib/activity-logger";

// After user action
await logActivity({ userId, type: "note_created", entityType: "note", entityId: note.id, title });
await checkAndAwardAchievements(userId, "note_created", { noteId: note.id });
```

Get progress:
```typescript
import { getUserProgress } from "@/lib/gamification-helpers";
const progress = await getUserProgress(userId);
// { level, currentXP, xpToNextLevel, totalXP, achievements }
```

Show modals: Add `<GamificationModals />` to layout

## Flow

User Action → Log Activity → Award XP → Check Achievements → Unlock Badge → Show Modal

## Models

**UserProgress:** `level`, `currentXP`, `totalXP`, `currentStreak`

**Achievement:** `key`, `name`, `category`, `tier` (bronze/silver/gold/platinum), `xpReward`, `icon`, `condition`

**UserAchievement:** Links user to unlocked achievements, tracks `unlockedAt`, `seen`

## Achievements

60 achievements: Notes (11), Tasks (7), Flashcards (7), Exams (7), Study (5), Streaks (6), Mastery (4), Special (8), Profile (3), Social (2)

See [ALL_ACHIEVEMENTS_LIST.md](../ALL_ACHIEVEMENTS_LIST.md)

## Levels

Formula: `level = floor(sqrt(totalXP / 100)) + 1`

Level 10: 8,100 XP | Level 25: 57,600 XP | Level 50: 240,100 XP | Level 100: 980,100 XP

## API

- `GET /api/gamification/progress` - User progress
- `GET /api/gamification/achievements` - All achievements
- `GET /api/gamification/achievements/unseen` - New achievements
- `POST /api/gamification/achievements/:id/seen` - Mark seen

## Add Achievement

```typescript
await prisma.achievement.create({
  data: {
    key: "your-key", name: "Name", description: "How to unlock",
    category: "notes", tier: "bronze", xpReward: 50, icon: "🎯",
    condition: { type: "count", target: 10 }, isActive: true
  }
});
```

Add check in `lib/gamification-service.ts`

## Custom XP

```typescript
// lib/gamification.ts
export const XP_VALUES = {
  CREATE_NOTE: 5,
  COMPLETE_TASK: 10,
  // Add yours
};
```
