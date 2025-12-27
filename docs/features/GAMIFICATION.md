# Gamification System

Complete guide for the XP, levels, achievements, and badge system.

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [System Components](#system-components)
- [Implementation Guide](#implementation-guide)
- [Achievement List](#achievement-list)
- [Customization](#customization)

---

## Overview

The gamification system rewards users for actions with:
- **XP (Experience Points)** - Earned from activities
- **Levels** - Unlocked at XP thresholds (1-100)
- **Achievements** - Unlocked by completing milestones (60 total)
- **Badges** - Visual rewards for achievements

### Architecture

```
User Action → Log Activity → Award XP → Check Achievements → Unlock Badge → Show Modal
                ↓
         DailyProgress
         ActivityLog
```

---

## Quick Start

### 1. Awarding XP and Achievements

```typescript
import { checkAndAwardAchievements } from "@/lib/gamification-service";
import { logActivity } from "@/lib/activity-logger";

// After user completes an action
async function createNote(userId: string, data: any) {
  const note = await prisma.note.create({ data });

  // Log activity
  await logActivity({
    userId,
    type: "note_created",
    entityType: "note",
    entityId: note.id,
    title: note.title,
  });

  // Award XP and check achievements
  await checkAndAwardAchievements(userId, "note_created", {
    noteId: note.id,
  });

  return note;
}
```

### 2. Displaying User Progress

```typescript
import { getUserProgress } from "@/lib/gamification-helpers";

const progress = await getUserProgress(userId);
// Returns: { level, currentXP, xpToNextLevel, totalXP, achievements }
```

### 3. Showing Achievement Modals

The system automatically shows modals for new achievements. Just ensure the `GamificationModals` component is in your layout:

```tsx
// app/layout.tsx
import GamificationModals from "@/components/gamification/gamification-modals";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <GamificationModals />
    </>
  );
}
```

---

## System Components

### Database Models

**UserProgress** - Stores user's XP and level
```prisma
model UserProgress {
  id          String   @id
  userId      String   @unique
  level       Int      @default(1)
  currentXP   Int      @default(0)
  totalXP     Int      @default(0)
  // ...
}
```

**Achievement** - Defines achievements
```prisma
model Achievement {
  key         String   @id
  name        String
  description String
  category    String   // 'notes', 'tasks', 'flashcards', etc.
  tier        String   // 'bronze', 'silver', 'gold', 'platinum'
  xpReward    Int
  icon        String   // Emoji
  condition   Json     // Unlock criteria
  // ...
}
```

**UserAchievement** - Tracks unlocked achievements
```prisma
model UserAchievement {
  id            String   @id
  userId        String
  achievementId String
  unlockedAt    DateTime
  seen          Boolean  @default(false)
  // ...
}
```

### Core Functions

**`checkAndAwardAchievements(userId, eventType, metadata)`**
- Awards XP for action
- Checks achievement conditions
- Unlocks achievements
- Updates user progress

**`logActivity(activityData)`**
- Logs user actions
- Updates daily progress
- Used for analytics

**`getUserProgress(userId)`**
- Gets current level, XP, achievements
- Calculates progress to next level

**`calculateLevel(totalXP)`**
- Converts XP to level (1-100)
- Formula: `floor(sqrt(totalXP / 100)) + 1`

---

## Implementation Guide

### Step 1: Add to Existing Features

Integrate gamification into your API routes:

```typescript
// app/api/notes/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json();
  const note = await prisma.note.create({
    data: {
      ...body,
      userId: user.id,
    },
  });

  // Add gamification
  await logActivity({
    userId: user.id,
    type: "note_created",
    entityType: "note",
    entityId: note.id,
    title: note.title,
  });

  await checkAndAwardAchievements(user.id, "note_created", {
    noteId: note.id,
  });

  return NextResponse.json({ note });
}
```

### Step 2: Display Progress in UI

```tsx
"use client";

import { useEffect, useState } from "react";
import { getUserProgress } from "@/lib/gamification-helpers";

export default function ProgressDisplay() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    async function loadProgress() {
      const data = await fetch("/api/gamification/progress");
      const json = await data.json();
      setProgress(json);
    }
    loadProgress();
  }, []);

  if (!progress) return <div>Loading...</div>;

  return (
    <div>
      <h2>Level {progress.level}</h2>
      <progress
        value={progress.currentXP}
        max={progress.xpToNextLevel}
      />
      <p>{progress.currentXP} / {progress.xpToNextLevel} XP</p>
      <p>{progress.achievements.length} Achievements</p>
    </div>
  );
}
```

### Step 3: Create Achievement Modal Component

The modal is already implemented in `components/gamification/gamification-modals.tsx`. It:
- Polls for unseen achievements every 5 seconds
- Shows confetti animation
- Displays badge and XP reward
- Marks achievement as seen when closed

---

## Achievement List

### Achievement Tiers

- **Bronze** (19) - Easy, early-game achievements
- **Silver** (20) - Medium difficulty milestones
- **Gold** (15) - Challenging accomplishments
- **Platinum** (6) - Elite, rare achievements

### Categories

**Notes** (11 achievements)
- `welcome` - Create account (10 XP, Bronze)
- `first-note` - Create first note (25 XP, Bronze)
- `notes-10` - Create 10 notes (50 XP, Bronze)
- `notes-50` - Create 50 notes (150 XP, Silver)
- `notes-100` - Create 100 notes (300 XP, Gold)
- `notes-500` - Create 500 notes (750 XP, Platinum)
- `note-marathon` - Create 10 notes in one day (100 XP, Silver)
- `note-master` - Update 100 notes (200 XP, Silver)
- `first-link` - Create first note link (30 XP, Bronze)
- `linker` - Link 25 notes (100 XP, Silver)
- `knowledge-graph` - Create 100 note links (300 XP, Gold)

**Tasks** (7 achievements)
- `first-task` - Create first task (25 XP, Bronze)
- `tasks-10` - Complete 10 tasks (50 XP, Bronze)
- `tasks-50` - Complete 50 tasks (150 XP, Silver)
- `tasks-100` - Complete 100 tasks (300 XP, Gold)
- `tasks-500` - Complete 500 tasks (750 XP, Platinum)
- `task-speedrun` - Complete 20 tasks in one day (100 XP, Silver)
- `priority-master` - Complete 50 high-priority tasks (200 XP, Gold)

**Flashcards** (7 achievements)
- `first-deck` - Create first deck (25 XP, Bronze)
- `cards-reviewed-100` - Review 100 cards (75 XP, Bronze)
- `cards-reviewed-500` - Review 500 cards (200 XP, Silver)
- `cards-reviewed-1000` - Review 1,000 cards (400 XP, Gold)
- `cards-reviewed-5000` - Review 5,000 cards (1000 XP, Platinum)
- `perfect-session` - Get 20 cards perfect in one session (150 XP, Silver)
- `retention-master` - Achieve 90% retention rate (300 XP, Gold)

**Study Sessions** (5 achievements)
- `first-session` - Complete first focus session (30 XP, Bronze)
- `focus-hour` - Study for 1 hour (50 XP, Bronze)
- `focus-10-hours` - Study for 10 hours total (150 XP, Silver)
- `focus-50-hours` - Study for 50 hours total (400 XP, Gold)
- `focus-100-hours` - Study for 100 hours total (800 XP, Platinum)

**Streaks** (6 achievements)
- `streak-3` - Study 3 days in a row (40 XP, Bronze)
- `streak-7` - Study 7 days in a row (100 XP, Bronze)
- `streak-14` - Study 14 days in a row (200 XP, Silver)
- `streak-30` - Study 30 days in a row (400 XP, Gold)
- `streak-100` - Study 100 days in a row (800 XP, Platinum)
- `streak-365` - Study 365 days in a row (2000 XP, Platinum)

**Levels** (4 achievements)
- `level-10` - Reach level 10 (100 XP, Bronze)
- `level-25` - Reach level 25 (250 XP, Silver)
- `level-50` - Reach level 50 (500 XP, Gold)
- `level-100` - Reach level 100 (1000 XP, Platinum)

**Exams** (7 achievements)
- `first-exam` - Create first exam (30 XP, Bronze)
- `exams-completed-10` - Complete 10 exams (100 XP, Silver)
- `perfect-exam` - Get 100% on an exam (150 XP, Silver)
- `exam-master` - Average 90% on 10 exams (300 XP, Gold)
- `quick-learner` - Complete exam in under 5 minutes (100 XP, Silver)
- `questions-created-100` - Create 100 questions (200 XP, Silver)
- `exams-aced-50` - Get 90%+ on 50 exams (600 XP, Platinum)

**Special** (8 achievements)
- `early-bird` - Study before 7 AM (50 XP, Bronze)
- `night-owl` - Study after 11 PM (50 XP, Bronze)
- `weekend-warrior` - Study on weekend (40 XP, Bronze)
- `tag-master` - Create 25 tags (75 XP, Bronze)
- `organizer` - Create 10 folders (60 XP, Bronze)
- `first-share` - Share content for the first time (50 XP, Bronze)
- `social-butterfly` - Share 10 items (150 XP, Silver)
- `perfect-week` - Study every day for a week with 90%+ performance (300 XP, Gold)

**Profile** (3 achievements)
- `profile-complete` - Complete profile (40 XP, Bronze)
- `avatar-set` - Upload profile picture (30 XP, Bronze)
- `settings-master` - Customize 5 settings (50 XP, Bronze)

**Community** (2 achievements)
- `bug-reporter` - Report your first bug (100 XP, Silver)
- `contributor` - Suggest a feature (100 XP, Silver)

Total: **60 achievements**, **14,265 XP** available

---

## Customization

### Adding New Achievements

1. **Define achievement in database:**

```typescript
// Use a script or admin panel
await prisma.achievement.create({
  data: {
    key: "your-achievement-key",
    name: "Achievement Name",
    description: "What the user needs to do",
    category: "notes",
    tier: "bronze",
    xpReward: 50,
    icon: "🎯",
    condition: {
      type: "count",
      target: 10,
      metric: "notes_created",
    },
    isActive: true,
    isSecret: false,
  },
});
```

2. **Update gamification service logic:**

```typescript
// lib/gamification-service.ts
// Add your achievement check in checkAndAwardAchievements function
```

### Creating Custom XP Values

```typescript
// lib/gamification.ts
export const XP_VALUES = {
  CREATE_NOTE: 5,
  UPDATE_NOTE: 2,
  CREATE_TASK: 3,
  COMPLETE_TASK: 10,
  REVIEW_FLASHCARD: 2,
  CREATE_FLASHCARD: 3,
  COMPLETE_EXAM: 20,
  FOCUS_SESSION_15MIN: 5,
  FOCUS_SESSION_30MIN: 10,
  DAILY_LOGIN: 10,
  WEEK_STREAK: 50,
  // Add your own
  YOUR_ACTION: 15,
};
```

### Custom Badge Design

Badges are currently emoji-based. To use custom images:

1. **Create badge images** (512x512px PNG)
2. **Save to** `/public/badges/{achievement-key}.png`
3. **Update Achievement component** to load images:

```tsx
// components/gamification/achievement-badge.tsx
const badgeUrl = `/badges/${achievement.key}.png`;

<img
  src={badgeUrl}
  alt={achievement.name}
  onError={(e) => {
    // Fallback to emoji
    e.currentTarget.style.display = "none";
  }}
/>
```

See badge design specs in parent docs for guidelines.

---

## API Endpoints

**GET `/api/gamification/progress`**
- Returns user's level, XP, and achievements

**GET `/api/gamification/achievements`**
- Returns all achievements with unlock status

**GET `/api/gamification/achievements/unseen`**
- Returns achievements user hasn't seen modal for

**POST `/api/gamification/achievements/:id/seen`**
- Mark achievement as seen

**GET `/api/gamification/leaderboard`**
- Returns top users by XP (optional)

---

## Troubleshooting

### Achievements not unlocking

1. Check event type matches in `checkAndAwardAchievements`
2. Verify achievement conditions in database
3. Check logs for errors
4. Ensure `isActive: true` on achievement

### XP not being awarded

1. Verify `logActivity` is being called
2. Check `DailyProgress` is updating
3. Ensure XP values are defined
4. Check database permissions

### Modals not showing

1. Ensure `GamificationModals` in layout
2. Check polling is active (every 5s)
3. Verify `seen: false` on achievements
4. Check browser console for errors

---

## Performance Considerations

- Achievement checks run after user actions (async, don't block)
- Modal polling every 5 seconds (only when component mounted)
- Database queries use indexes on userId
- Consider caching getUserProgress results

---

## Future Enhancements

- Leaderboards (global, friends)
- Daily/weekly challenges
- Seasonal events
- Custom badge uploads
- Social sharing of achievements
- Achievement statistics
- Rarity percentages
- Achievement hints system

---

**Related Documentation:**
- [ALL_ACHIEVEMENTS_LIST.md](../ALL_ACHIEVEMENTS_LIST.md) - Complete achievement definitions
- [GAMIFICATION_MODALS_SETUP.md](../GAMIFICATION_MODALS_SETUP.md) - Modal setup guide

**Last Updated:** December 2024
