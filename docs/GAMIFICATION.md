# Gamification System Guide

Complete guide for implementing and using the gamification system in Study Buddy.

## Overview

The gamification system rewards users for learning activities with:
- **XP (Experience Points)**: Earned for all actions
- **Levels**: Calculated from total XP using formula: `XP = (level - 1)² × 100`
- **Achievements**: 60 badges across 10 categories
- **Streaks**: Daily activity tracking

## Quick Start

### For New Developers

1. **Database is already set up** with achievements seeded
2. **Components are ready** - badge displays, XP bars, level indicators
3. **You need to integrate XP awards** into your API routes

### Integration Checklist

For each feature endpoint, add:
- [ ] Award XP when action completes
- [ ] Increment cumulative counters (for count-based achievements)
- [ ] Check for achievement unlocks
- [ ] Update daily progress (for streak tracking)

## XP Values

Reward amounts for different actions:

### Notes & Organization
- Create note: `5 XP`
- Update note: `2 XP`
- Create folder: `3 XP`
- Tag item: `1 XP`

### Tasks
- Create task: `3 XP`
- Complete task: `10 XP`

### Flashcards
- Create deck: `5 XP`
- Create flashcard: `2 XP`
- Review flashcard: `2 XP`
- Correct review: `3 XP` (bonus)

### Study Sessions
- 15 min: `10 XP`
- 25 min: `15 XP`
- 45 min: `25 XP`
- 60 min: `35 XP`

### Exams
- Create exam: `8 XP`
- Complete exam: `20 XP`
- Perfect score (100%): `50 XP` (bonus)

### Streaks
- Daily login: `5 XP`
- Week streak: `50 XP`
- Month streak: `200 XP`

## Achievements Overview

**Total**: 60 achievements across 10 categories

| Category | Count | Examples |
|----------|-------|----------|
| Notes | 11 | First Steps, Knowledge Builder, Master Scribe |
| Tasks | 7 | Go-Getter, Task Master, Early Bird |
| Flashcards | 7 | Deck Builder, Memory Palace, Perfect Recall |
| Exams | 7 | Test Taker, Perfect Score, Variety Expert |
| Special | 8 | Well-Rounded Learner, Night Owl, Speed Learner |
| Study | 5 | Focus Beginner, Scholar, Academic Legend |
| Streak | 6 | Week Warrior, Month Master, Year of Excellence |
| Mastery | 4 | Rising Star, Expert Learner, Legendary Scholar |
| Profile | 3 | Welcome Aboard, Face of Knowledge |
| Social | 2 | Bug Hunter, Quality Contributor |

[View complete list in ALL_ACHIEVEMENTS_LIST.md](./ALL_ACHIEVEMENTS_LIST.md)

## Implementation Guide

### Step 1: Award XP for Actions

```typescript
import { awardXP } from '@/lib/gamification-service';
import { XP_VALUES } from '@/lib/gamification';

// After creating a note
const result = await awardXP(userId, XP_VALUES.CREATE_NOTE);

// result contains:
// - xpGained: number
// - totalXP: number
// - newLevel: number
// - previousLevel: number
// - leveledUp: boolean
```

### Step 2: Track Cumulative Counts

For achievements that count items created (notes, tasks, decks, etc.):

```typescript
// Increment counter (never decreases, even on deletion)
await prisma.userProgress.upsert({
  where: { userId },
  create: { userId, totalNotesCreated: 1 },
  update: { totalNotesCreated: { increment: 1 } }
});
```

### Step 3: Check for Achievements

```typescript
import { checkCountBasedAchievements } from '@/lib/achievement-helpers';

// After updating counters
await checkCountBasedAchievements(userId);
```

### Step 4: Update Daily Progress

For streak tracking and daily challenges:

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

await prisma.dailyProgress.upsert({
  where: { userId_date: { userId, date: today } },
  create: { userId, date: today, tasksCompleted: 1 },
  update: { tasksCompleted: { increment: 1 } }
});
```

## Complete Integration Example

Here's a full example for completing a task:

```typescript
// app/api/tasks/[id]/route.ts
import { awardXP } from '@/lib/gamification-service';
import { XP_VALUES } from '@/lib/gamification';
import {
  checkActionBasedAchievements,
  checkDailyChallenges,
  checkCompoundAchievements
} from '@/lib/achievement-helpers';

export async function PATCH(request: Request) {
  // ... your existing task update logic ...

  const task = await prisma.task.update({
    where: { id },
    data: { completed: true }
  });

  // Gamification integration
  try {
    // 1. Award XP
    await awardXP(userId, XP_VALUES.COMPLETE_TASK);

    // 2. Update daily progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyProgress.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, tasksCompleted: 1 },
      update: { tasksCompleted: { increment: 1 } }
    });

    // 3. Track early completions (for early-bird achievement)
    if (task.dueDate && new Date() < new Date(task.dueDate)) {
      await prisma.userProgress.update({
        where: { userId },
        data: { earlyTaskCompletions: { increment: 1 } }
      });
    }

    // 4. Check for achievements
    await checkActionBasedAchievements(userId);
    await checkDailyChallenges(userId);
    await checkCompoundAchievements(userId);

  } catch (error) {
    console.error('Gamification error:', error);
    // Don't fail the main operation if gamification fails
  }

  return NextResponse.json({ success: true, task });
}
```

## UI Components

### Display XP Progress

```typescript
import { XPBar } from '@/components/gamification/xp-bar';

<XPBar totalXP={userProgress.totalXP} showDetails />
```

### Display Level Badge

```typescript
import { LevelBadge } from '@/components/gamification/level-badge';

<LevelBadge totalXP={userProgress.totalXP} size="md" />
```

### Display Achievement

```typescript
import { AchievementBadge } from '@/components/gamification/achievement-badge';

<AchievementBadge
  achievement={achievementDefinition}
  unlocked={true}
  unlockedAt={new Date()}
  size="md"
/>
```

### Show Toast Notifications

```typescript
import { showAchievementToast, showXPGainToast } from '@/components/gamification/achievement-toast';

// XP gained
showXPGainToast(10, 'completing a task');

// Achievement unlocked
showAchievementToast({
  achievement: achievementDef,
  xpGained: 100
});
```

## API Endpoints

### GET /api/gamification/progress
Get user's current progress and achievements:

```typescript
const response = await fetch('/api/gamification/progress');
const { progress, achievements } = await response.json();
```

### POST /api/gamification/xp
Manually award XP (use sparingly, prefer server-side `awardXP` function):

```typescript
const response = await fetch('/api/gamification/xp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ xp: 10, action: 'completing task' }),
});
```

### GET /api/gamification/achievements
Get all achievements with user's unlock status:

```typescript
const response = await fetch('/api/gamification/achievements');
const { allAchievements, userAchievements } = await response.json();
```

## Database Schema

### UserProgress

Tracks user XP, level, and cumulative counters:

```prisma
model UserProgress {
  id              String   @id @default(uuid())
  userId          String   @unique
  totalXP         Int      @default(0)
  level           Int      @default(1)
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastActiveDate  DateTime @default(now())

  // Cumulative counters (never decrease)
  totalNotesCreated      Int @default(0)
  totalFoldersCreated    Int @default(0)
  totalTagsUsed          Int @default(0)
  totalTasksCreated      Int @default(0)
  totalDecksCreated      Int @default(0)
  totalExamsCreated      Int @default(0)
  totalQuestionsCreated  Int @default(0)
  totalLinksCreated      Int @default(0)

  // Special tracking
  currentReviewStreak    Int @default(0)
  longestReviewStreak    Int @default(0)
  earlyTaskCompletions   Int @default(0)
}
```

### DailyProgress

Tracks daily activity for streaks and challenges:

```prisma
model DailyProgress {
  id                String   @id @default(uuid())
  userId            String
  date              DateTime
  tasksCompleted    Int      @default(0)
  cardsReviewed     Int      @default(0)
  notesCreated      Int      @default(0)
  notesUpdated      Int      @default(0)
  focusMinutes      Int      @default(0)
  examsCompleted    Int      @default(0)
  questionsAnswered Int      @default(0)

  @@unique([userId, date])
}
```

## Achievement Types

### Count-Based Achievements
Unlock when cumulative count reaches threshold:
- Create X notes/tasks/decks/exams
- Complete X tasks
- Review X flashcards
- Study for X hours

**Implementation**: Use cumulative counters in `UserProgress`

### Action-Based Achievements
Unlock based on current database state:
- Level milestones
- Current streak length

**Implementation**: Query database counts when checking

### Daily Challenge Achievements
One-time unlock for completing high daily activity:
- Complete 10 tasks in one day
- Review 50 flashcards in one day
- Answer 20 exam questions in one day

**Implementation**: Check `DailyProgress` counters

### Compound Achievements
Require multiple conditions:
- Well-Rounded Learner: Use all 5 main features
- Power User: Level 20 + 100 completed tasks
- Priority Master: Complete tasks of all priority levels

**Implementation**: Custom checking logic in `achievement-helpers.ts`

### Time-Based Achievements
Unlock based on time of action:
- Night Owl: Study session 11 PM - 11:59 PM
- Early Riser: Study session 12 AM - 5:59 AM

**Implementation**: Check `new Date().getHours()` when recording action

## Achievement Permanence

### Deletion-Proof (42 achievements)
These cannot be lost even if user deletes items:
- All action-based (tasks completed, cards reviewed)
- All study time achievements
- All streak achievements
- All level/mastery achievements
- All profile and social achievements

### Requires Cumulative Tracking (18 achievements)
These need special counters that never decrease:
- Count-based creation achievements (notes, tasks, decks created)
- Organization achievements (folders, tags, links)

**Solution**: Use `totalXCreated` fields in `UserProgress` that increment on creation but never decrement on deletion.

## Helper Functions

Located in `/lib/achievement-helpers.ts`:

### `checkCountBasedAchievements(userId: string)`
Checks all count-based achievements (notes, tasks, decks, etc.)

### `checkActionBasedAchievements(userId: string)`
Checks achievements based on current database state (tasks completed, cards reviewed, study hours, levels, streaks)

### `checkDailyChallenges(userId: string)`
Checks one-time daily challenge achievements

### `checkCompoundAchievements(userId: string)`
Checks achievements requiring multiple conditions

### `checkPerfectScore(userId: string, examAttemptId: string)`
Checks if exam score is 100%

### `checkVarietyExpert(userId: string, examId: string)`
Checks if exam uses all question types

## Testing

### Run Tests

```bash
# All gamification tests
npm test gamification

# Specific test file
npm test achievement-permanence

# Visual UI
npm run test:ui
```

### Test Coverage

Tests verify:
- All 60 achievements are defined
- XP values are set for all actions
- API integration works correctly
- Achievement unlock logic functions
- Deletion doesn't remove earned achievements

## Best Practices

### Error Handling
Always wrap gamification code in try-catch:

```typescript
try {
  await awardXP(userId, XP_VALUES.CREATE_NOTE);
  await checkCountBasedAchievements(userId);
} catch (error) {
  console.error('Gamification error:', error);
  // Don't fail the main operation
}
```

### Performance
- Batch achievement checks when possible
- Use `upsert` for UserProgress to handle first-time creation
- Don't block main operations waiting for gamification

### User Experience
- Show immediate feedback with toast notifications
- Display progress on relevant pages (dashboard, settings)
- Don't spam notifications - group related achievements

### Consistency
- Award XP immediately after action completes
- Update counters atomically with action
- Check achievements after counters update

## Migration Guide

If you have existing data:

1. **Run migration** to add tracking fields:
   ```bash
   npx prisma migrate dev --name add_gamification_tracking
   ```

2. **Seed achievements**:
   ```bash
   npx tsx prisma/seed-achievements.ts
   ```

3. **Backfill user progress** (optional):
   ```bash
   npx tsx prisma/init-user-progress.ts
   ```

4. **Integrate XP awards** into your API routes using examples above

## Common Issues

### Achievements not unlocking
- Verify `checkAndUnlockAchievement()` is being called
- Check achievement key matches exactly
- Ensure user has UserProgress record
- Look for errors in server logs

### XP not updating
- Confirm `awardXP()` is being called
- Verify userId is correct
- Check UserProgress record exists
- Review transaction completion

### Tests failing
- Run `npx prisma generate` after schema changes
- Restart TypeScript server in VS Code
- Check test database is properly configured

## Future Enhancements

Potential additions to the system:

- [ ] Achievement hints for locked badges
- [ ] Leaderboards and rankings
- [ ] Social sharing of achievements
- [ ] Seasonal/limited-time achievements
- [ ] Achievement categories and filters
- [ ] Daily/weekly challenges with rotating goals
- [ ] Custom badge images (currently using emojis)
- [ ] Achievement unlock animations

## Resources

- [Complete Achievement List](./ALL_ACHIEVEMENTS_LIST.md) - All 60 badges with requirements
- [Badge Design Guide](./BADGES.md) - Creating custom badge images
- [Integration Examples](./GAMIFICATION_INTEGRATION.md) - More code examples
- [Testing Guide](../TESTING_QUICKSTART.md) - How to run tests

---

**Status**: System implemented and tested
**Achievements**: 60 badges across 10 categories
**Components**: Ready to use
**Next Step**: Integrate XP awards into your API routes
