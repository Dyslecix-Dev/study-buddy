# Spaced Repetition

SM-2 algorithm for flashcard review scheduling.

## How It Works

Review flashcard → Rate difficulty (1-5) → Algorithm calculates next review → Cards you struggle with appear more often

## Quality Ratings

| Quality | Label | Meaning | Next Interval |
|---------|-------|---------|---------------|
| 0-2 | Wrong/Hard | Incorrect | Reset to 1 day |
| 3 | Hard | Correct with difficulty | Based on ease factor |
| 4 | Good | Correct with effort | Based on ease factor |
| 5 | Easy | Perfect recall | Based on ease factor |

## Algorithm

```typescript
// lib/spaced-repetition.ts
export function calculateNextReview(card: Flashcard, quality: 0 | 1 | 2 | 3 | 4 | 5): ReviewResult {
  let { easeFactor, interval, repetitions } = card;
  
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  
  if (quality < 3) {
    repetitions = 0; interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
  }
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  return { easeFactor, interval, repetitions, nextReview };
}
```

## Schema

```prisma
model Flashcard {
  easeFactor @default(2.5), interval @default(0), repetitions @default(0),
  nextReview DateTime?, lastReviewed DateTime?, Review Review[]
}
model Review { flashcardId, quality Int, createdAt }
```

## Usage

```typescript
async function reviewFlashcard(flashcardId: string, quality: number) {
  const flashcard = await prisma.flashcard.findUnique({ where: { id: flashcardId } });
  const result = calculateNextReview(flashcard, quality as 0|1|2|3|4|5);
  
  await prisma.flashcard.update({
    where: { id: flashcardId },
    data: { easeFactor: result.easeFactor, interval: result.interval, repetitions: result.repetitions, nextReview: result.nextReview, lastReviewed: new Date() }
  });
  await prisma.review.create({ data: { flashcardId, quality } });
  return result;
}
```

## Review Queue

```typescript
const dueCards = await prisma.flashcard.findMany({
  where: { deckId, OR: [{ nextReview: null }, { nextReview: { lte: new Date() } }] },
  orderBy: { nextReview: "asc" }
});
```

## API

- `POST /api/flashcards/:id/review` - Submit review
- `GET /api/decks/:id/due` - Get due cards
- `GET /api/flashcards/stats` - Statistics

## Tips

Review daily, be honest with ratings, don't cram, prioritize overdue cards
