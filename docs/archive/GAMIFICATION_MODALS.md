# Gamification Modals

This document explains how to use the achievement unlock and level-up modal system.

## Overview

The gamification system now includes beautiful, animated modals that automatically appear when:
- A user unlocks an achievement
- A user levels up

These modals include:
- Celebration animations
- Sound effects (optional)
- Achievement details (name, description, tier, XP reward)
- Level progression display
- Click-to-dismiss or click-outside-to-dismiss functionality

## Components

### 1. Achievement Unlock Modal
Located at: `components/gamification/achievement-unlock-modal.tsx`

Displays when a user unlocks an achievement, showing:
- Achievement icon with glow effect
- Achievement name
- Badge tier (Bronze, Silver, Gold, Platinum)
- Description/requirements
- XP earned
- Celebratory animations

### 2. Level Up Modal
Located at: `components/gamification/level-up-modal.tsx`

Displays when a user levels up, showing:
- Old level → New level progression
- Celebratory animations
- Congratulations message
- Celebration emoji with effects

### 3. Gamification Context
Located at: `contexts/gamification-context.tsx`

Global context provider that manages:
- Achievement notification queue
- Level-up notification queue
- Modal display logic
- Sequential display (shows one at a time)

## Usage

### For Client Components

Use the `useGamificationEvents` hook to handle API responses:

```tsx
'use client';

import { useGamificationEvents } from '@/hooks/use-gamification-events';

export function MyComponent() {
  const { handleGamificationResult } = useGamificationEvents();

  const handleAction = async () => {
    const response = await fetch('/api/some-action', {
      method: 'POST',
      body: JSON.stringify({ /* ... */ }),
    });

    const result = await response.json();

    // This will automatically show modals if achievements were unlocked or level-up occurred
    if (result.gamification) {
      handleGamificationResult(result.gamification);
    }
  };

  return <button onClick={handleAction}>Do Action</button>;
}
```

### For API Routes

Your API routes should return gamification results from helper functions:

```typescript
import { awardXP } from '@/lib/gamification-service';
import { checkAndUnlockAchievement } from '@/lib/gamification-service';
import { checkCountBasedAchievements, checkActionBasedAchievements } from '@/lib/achievement-helpers';

export async function POST(request: Request) {
  // ... perform action ...

  // Award XP for the action
  const gamificationResult = await awardXP(userId, 10, 'created note');

  // Check for achievements
  const achievements = await checkCountBasedAchievements(userId);
  gamificationResult.achievementsUnlocked = achievements;

  // Return in response
  return NextResponse.json({
    success: true,
    data: { /* your data */ },
    gamification: gamificationResult, // Include this in your response
  });
}
```

### Gamification Result Type

The `GamificationResult` interface:

```typescript
interface GamificationResult {
  xpGained: number;
  achievementsUnlocked: AchievementDefinition[];
  leveledUp: boolean;
  newLevel?: number;
  oldLevel?: number;
}
```

## Sound Effects

Sound files should be placed in `public/sounds/`:
- `achievement-unlock.mp3` - Plays when an achievement is unlocked
- `level-up.mp3` - Plays when a user levels up

See `public/sounds/README.md` for details on obtaining suitable sound files.

**Note:** Sound effects are optional. The modals will work without them (audio will fail silently).

## Modal Behavior

- **Sequential Display**: If multiple achievements are unlocked at once, they will be shown one after another
- **Priority**: Level-up modals are shown before achievement modals
- **Dismissible**: Users can close modals by:
  - Clicking the X button
  - Clicking the "Continue" button
  - Clicking outside the modal
- **Animations**: Smooth fade-in, zoom-in, and bounce animations
- **Responsive**: Works on all screen sizes

## Testing

You can manually trigger modals using the context:

```tsx
import { useGamification } from '@/contexts/gamification-context';
import { ACHIEVEMENTS } from '@/lib/gamification';

function TestComponent() {
  const { showAchievementUnlock, showLevelUp } = useGamification();

  return (
    <div>
      <button onClick={() => showAchievementUnlock(ACHIEVEMENTS[0], 10)}>
        Test Achievement
      </button>
      <button onClick={() => showLevelUp(1, 2)}>
        Test Level Up
      </button>
    </div>
  );
}
```

## Integration Checklist

To integrate gamification modals into a new feature:

1. ✅ Award XP using `awardXP()`
2. ✅ Check for achievements using helpers from `lib/achievement-helpers.ts`
3. ✅ Return gamification result in API response
4. ✅ Use `useGamificationEvents` hook in client component
5. ✅ Call `handleGamificationResult()` with API response

## Example: Complete Integration

**API Route** (`app/api/notes/route.ts`):
```typescript
import { awardXP } from '@/lib/gamification-service';
import { checkCountBasedAchievements } from '@/lib/achievement-helpers';

export async function POST(request: Request) {
  // Create note logic...
  const note = await prisma.note.create({ /* ... */ });

  // Award XP
  const gamificationResult = await awardXP(userId, 5, 'created note');

  // Check achievements
  const noteCount = await prisma.note.count({ where: { userId } });
  const achievements = await checkCountBasedAchievements(userId);
  gamificationResult.achievementsUnlocked = achievements;

  return NextResponse.json({
    note,
    gamification: gamificationResult,
  });
}
```

**Client Component**:
```tsx
'use client';

import { useGamificationEvents } from '@/hooks/use-gamification-events';

export function CreateNoteButton() {
  const { handleGamificationResult } = useGamificationEvents();

  const createNote = async () => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ title: 'My Note' }),
    });

    const { note, gamification } = await response.json();

    // Show modals automatically
    if (gamification) {
      handleGamificationResult(gamification);
    }
  };

  return <button onClick={createNote}>Create Note</button>;
}
```
