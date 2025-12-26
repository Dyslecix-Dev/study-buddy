# Gamification Modal Integration Example

This file provides a complete example of how to integrate the achievement and level-up modals into an API endpoint and client component.

## Example: Task Completion with Gamification Modals

### Step 1: API Route (Server-Side)

```typescript
// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { awardXP, GamificationResult } from "@/lib/gamification-service";
import { XP_VALUES } from "@/lib/gamification";
import {
  checkActionBasedAchievements,
  checkDailyChallenges,
  checkCompoundAchievements
} from "@/lib/achievement-helpers";
import { createGamificationResult, safeGamification } from "@/lib/gamification-helpers";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { completed } = body;

  // Find existing task
  const existingTask = await prisma.task.findFirst({
    where: { id, userId: user.id },
  });

  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Initialize gamification result
  let gamificationResult: GamificationResult = createGamificationResult();

  // Track progress when task completion status changes
  if (completed !== undefined && completed !== existingTask.completed && completed) {
    // Task is being completed - award XP and check achievements
    gamificationResult = await safeGamification(async () => {
      // Award XP for completing task
      const xpResult = await awardXP(user.id, XP_VALUES.COMPLETE_TASK);

      // Check for achievements
      await checkActionBasedAchievements(user.id);
      await checkDailyChallenges(user.id);
      await checkCompoundAchievements(user.id);

      // Get newly unlocked achievements from helper functions
      // Note: The check functions unlock achievements internally
      // We need to get them from the database or track them differently

      return xpResult;
    }, createGamificationResult());
  }

  // Update the task
  const task = await prisma.task.update({
    where: { id },
    data: { completed },
    include: { Tag: true },
  });

  // Return task data with gamification results
  return NextResponse.json({
    task,
    gamification: gamificationResult,
  });
}
```

### Step 2: Client Component

```typescript
// components/tasks/task-item.tsx
'use client';

import { useState } from 'react';
import { useGamificationEvents } from '@/hooks/use-gamification-events';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskItem({ task }: { task: Task }) {
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isLoading, setIsLoading] = useState(false);
  const { handleGamificationResult } = useGamificationEvents();

  const toggleComplete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !isCompleted }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCompleted(data.task.completed);

        // Handle gamification events - this will show modals automatically!
        if (data.gamification) {
          handleGamificationResult(data.gamification);
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={toggleComplete}
        disabled={isLoading}
      />
      <span className={isCompleted ? 'line-through' : ''}>
        {task.title}
      </span>
    </div>
  );
}
```

## Better Implementation: Collecting Achievements from Helper Functions

The challenge is that helper functions like `checkActionBasedAchievements` unlock achievements internally but don't return them. Here's an improved approach:

### Enhanced API Route

```typescript
import { checkAndUnlockAchievement } from "@/lib/gamification-service";
import { addAchievements } from "@/lib/gamification-helpers";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // ... task update logic ...

  if (completed && !existingTask.completed) {
    gamificationResult = await safeGamification(async () => {
      // Award XP
      const xpResult = await awardXP(user.id, XP_VALUES.COMPLETE_TASK);

      // Manually check specific achievements and collect results
      const tasksCompleted = await prisma.task.count({
        where: { userId: user.id, completed: true },
      });

      const unlockedAchievements = [];

      // Check task completion milestones
      if (tasksCompleted === 10) {
        const result = await checkAndUnlockAchievement(user.id, 'tasks-completed-10');
        if (result.unlocked && result.achievement) {
          unlockedAchievements.push(result.achievement);
        }
      }
      if (tasksCompleted === 50) {
        const result = await checkAndUnlockAchievement(user.id, 'tasks-completed-50');
        if (result.unlocked && result.achievement) {
          unlockedAchievements.push(result.achievement);
        }
      }
      // ... check other milestones ...

      // Add achievements to result
      return addAchievements(xpResult, unlockedAchievements);
    }, createGamificationResult());
  }

  return NextResponse.json({
    task,
    gamification: gamificationResult,
  });
}
```

## Testing the Modals

You can test the modals by creating a test component:

```typescript
'use client';

import { useGamification } from '@/contexts/gamification-context';
import { ACHIEVEMENTS } from '@/lib/gamification';

export function TestGamificationModals() {
  const { showAchievementUnlock, showLevelUp } = useGamification();

  return (
    <div className="p-4 space-y-4">
      <h2>Test Gamification Modals</h2>

      <button
        onClick={() => showAchievementUnlock(ACHIEVEMENTS[0], ACHIEVEMENTS[0].xpReward)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Achievement Modal
      </button>

      <button
        onClick={() => showLevelUp(1, 2)}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Test Level Up Modal
      </button>

      <button
        onClick={() => {
          // Test multiple achievements
          ACHIEVEMENTS.slice(0, 3).forEach((achievement, index) => {
            setTimeout(() => {
              showAchievementUnlock(achievement, achievement.xpReward);
            }, index * 100);
          });
        }}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Test Multiple Achievements
      </button>

      <button
        onClick={() => {
          // Test achievement + level up
          showAchievementUnlock(ACHIEVEMENTS[0], ACHIEVEMENTS[0].xpReward);
          setTimeout(() => showLevelUp(4, 5), 100);
        }}
        className="px-4 py-2 bg-orange-500 text-white rounded"
      >
        Test Achievement + Level Up
      </button>
    </div>
  );
}
```

## Key Points

1. **Gamification Result Structure**: API routes should return a `gamification` field containing:
   - `xpGained`: Total XP earned
   - `achievementsUnlocked`: Array of unlocked achievements
   - `leveledUp`: Boolean indicating if user leveled up
   - `oldLevel` and `newLevel`: Level progression data

2. **Client Integration**: Use `useGamificationEvents` hook and call `handleGamificationResult()` with the API response

3. **Modal Queue**: Modals are shown sequentially - level-ups first, then achievements one by one

4. **Sound Effects**: Optional audio files in `/public/sounds/` will play automatically

5. **Error Handling**: Use `safeGamification` wrapper to prevent gamification errors from breaking main functionality
