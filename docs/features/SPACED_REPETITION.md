# Spaced Repetition System

SM-2 algorithm implementation for flashcard review scheduling.

## Overview

The system uses the **SM-2 (SuperMemo 2) algorithm** to optimize flashcard review timing based on how well you remember each card.

## How It Works

1. **Review flashcard** - User rates difficulty (1-5)
2. **Calculate next review** - Algorithm determines when to show again
3. **Track performance** - Ease factor adjusts based on responses
4. **Optimize retention** - Cards you struggle with appear more frequently

## Algorithm

```typescript
// lib/spaced-repetition.ts
interface ReviewResult {
  easeFactor: number;    // Difficulty multiplier (1.3-2.5)
  interval: number;      // Days until next review
  repetitions: number;   // Successful reviews in a row
  nextReview: Date;      // Scheduled review date
}

export function calculateNextReview(
  card: Flashcard,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): ReviewResult {
  let { easeFactor, interval, repetitions } = card;

  // Update ease factor (how "easy" the card is)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate interval
  if (quality < 3) {
    // Failed recall - reset
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;           // 1 day
    } else if (repetitions === 2) {
      interval = 6;           // 6 days
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReview };
}
```

## Quality Ratings

| Quality | Label | Meaning | Next Interval |
|---------|-------|---------|---------------|
| 0 | Total blackout | Couldn't remember at all | Reset to 1 day |
| 1 | Wrong | Incorrect response | Reset to 1 day |
| 2 | Wrong but remembered | Incorrect but close | Reset to 1 day |
| 3 | Hard | Correct with difficulty | Based on ease factor |
| 4 | Good | Correct with some effort | Based on ease factor |
| 5 | Easy | Perfect recall | Based on ease factor |

## Database Schema

```prisma
model Flashcard {
  id           String    @id
  front        Json
  back         Json
  deckId       String
  easeFactor   Float     @default(2.5)
  interval     Int       @default(0)
  repetitions  Int       @default(0)
  nextReview   DateTime?
  lastReviewed DateTime?
  // ...
  Review       Review[]
}

model Review {
  id          String    @id
  flashcardId String
  quality     Int       // 0-5 rating
  createdAt   DateTime
  // ...
}
```

## Usage Example

```typescript
// After user reviews a card
async function reviewFlashcard(flashcardId: string, quality: number) {
  const flashcard = await prisma.flashcard.findUnique({
    where: { id: flashcardId },
  });

  // Calculate next review
  const result = calculateNextReview(flashcard, quality as 0 | 1 | 2 | 3 | 4 | 5);

  // Update flashcard
  await prisma.flashcard.update({
    where: { id: flashcardId },
    data: {
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReview: result.nextReview,
      lastReviewed: new Date(),
    },
  });

  // Log review
  await prisma.review.create({
    data: {
      flashcardId,
      quality,
    },
  });

  return result;
}
```

## Review Queue

Get cards due for review:

```typescript
// Get all cards due today or earlier
const dueCards = await prisma.flashcard.findMany({
  where: {
    deckId,
    OR: [
      { nextReview: null },                    // Never reviewed
      { nextReview: { lte: new Date() } },    // Due now
    ],
  },
  orderBy: {
    nextReview: "asc",                         // Oldest first
  },
});
```

## UI Component

```tsx
"use client";

import { useState } from "react";
import { calculateNextReview } from "@/lib/spaced-repetition";

export function ReviewSession({ deck }: { deck: Deck }) {
  const [cards, setCards] = useState(deck.dueCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentCard = cards[currentIndex];

  const handleRating = async (quality: number) => {
    await fetch(`/api/flashcards/${currentCard.id}/review`, {
      method: "POST",
      body: JSON.stringify({ quality }),
    });

    // Next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      alert("Review session complete!");
    }
  };

  return (
    <div>
      <h2>Card {currentIndex + 1} of {cards.length}</h2>

      <div className="flashcard">
        <div className="front">{currentCard.front}</div>
        {showAnswer && (
          <div className="back">{currentCard.back}</div>
        )}
      </div>

      {!showAnswer ? (
        <button onClick={() => setShowAnswer(true)}>
          Show Answer
        </button>
      ) : (
        <div className="rating-buttons">
          <button onClick={() => handleRating(1)}>Wrong</button>
          <button onClick={() => handleRating(3)}>Hard</button>
          <button onClick={() => handleRating(4)}>Good</button>
          <button onClick={() => handleRating(5)}>Easy</button>
        </div>
      )}
    </div>
  );
}
```

## Statistics

Track performance over time:

```typescript
// Get review statistics
async function getReviewStats(userId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      Flashcard: {
        Deck: { userId },
      },
    },
    include: {
      Flashcard: true,
    },
  });

  const totalReviews = reviews.length;
  const avgQuality = reviews.reduce((sum, r) => sum + r.quality, 0) / totalReviews;
  const retentionRate = reviews.filter(r => r.quality >= 3).length / totalReviews;

  return {
    totalReviews,
    avgQuality,
    retentionRate: retentionRate * 100,
  };
}
```

## Optimization Tips

1. **Review regularly** - Daily reviews maximize retention
2. **Be honest** - Accurate ratings improve scheduling
3. **Don't cram** - Algorithm works best with consistent practice
4. **Review due cards** - Prioritize overdue cards first
5. **Track progress** - Monitor retention rate over time

## Advanced Features

### Custom Intervals

Override default intervals:

```typescript
const CUSTOM_INTERVALS = {
  0: 1,      // Wrong -> 1 day
  1: 1,      // Wrong -> 1 day
  2: 1,      // Hard -> 1 day
  3: 3,      // Good -> 3 days
  4: 7,      // Easy -> 1 week
  5: 14,     // Perfect -> 2 weeks
};
```

### Difficulty Adjustments

Automatically adjust for user performance:

```typescript
// If user consistently gets cards wrong, reduce ease factor
if (card.repetitions === 0 && card.easeFactor > 1.3) {
  card.easeFactor -= 0.2;
}

// If user consistently gets cards right, increase ease factor
if (card.repetitions > 5 && card.easeFactor < 2.5) {
  card.easeFactor += 0.1;
}
```

## API Endpoints

**POST `/api/flashcards/:id/review`** - Submit review
```json
{
  "quality": 4
}
```

**GET `/api/decks/:id/due`** - Get due cards

**GET `/api/flashcards/stats`** - Get review statistics

## Related Files

- `lib/spaced-repetition.ts` - SM-2 algorithm
- `app/api/flashcards/[id]/review/route.ts` - Review endpoint
- `components/flashcards/review-session.tsx` - Review UI

**Last Updated:** December 2024
