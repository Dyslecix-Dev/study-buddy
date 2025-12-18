# Spaced Repetition System (SM-2 Algorithm)

This document explains how the spaced repetition system works in Study Buddy.

## Overview

Study Buddy uses the **SM-2 (SuperMemo 2) algorithm** to schedule flashcard reviews. This algorithm optimizes learning by showing cards at increasing intervals based on how well you know them.

## How It Works

### The SM-2 Algorithm

The SM-2 algorithm adjusts three key values for each flashcard:

1. **Ease Factor (EF)**: Represents how easy a card is to remember (default: 2.5, minimum: 1.3)
2. **Interval**: Number of days until the next review (starts at 0)
3. **Repetitions**: Count of consecutive successful reviews

### Quality Ratings

When reviewing a card, you rate your recall quality:

- **Wrong (0)**: Total failure to recall - card resets to 1-day interval
- **Hard (2)**: Correct but very difficult - moderate interval increase
- **Good (3)**: Correct with some effort - standard interval increase
- **Easy (5)**: Perfect recall - maximum interval increase

### Review Schedule

The algorithm calculates the next review date based on your rating:

**First successful review:** 1 day
**Second successful review:** 6 days
**Subsequent reviews:** Previous interval × Ease Factor

If you rate a card as "Wrong" (quality < 3), the card resets to a 1-day interval and you start over.

### Ease Factor Adjustment

The ease factor is adjusted after each review using this formula:

```
EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
```

Where:
- `EF'` is the new ease factor
- `EF` is the current ease factor
- `q` is the quality rating (0-5)

This means:
- Rating "Easy" (5) increases the ease factor → longer future intervals
- Rating "Hard" (2) or "Wrong" (0) decreases the ease factor → shorter future intervals

## Database Schema

Each flashcard stores the following SM-2 fields:

```prisma
model Flashcard {
  easeFactor   Float     @default(2.5)  // How easy the card is to remember
  interval     Int       @default(0)     // Days until next review
  repetitions  Int       @default(0)     // Consecutive successful reviews
  nextReview   DateTime?                 // Scheduled review date
  lastReviewed DateTime?                 // Last review timestamp
}
```

## API Usage

### Recording a Review

**POST** `/api/decks/[deckId]/flashcards/[flashcardId]/review`

Request body:
```json
{
  "rating": 0 | 2 | 3 | 5
}
```

Response:
```json
{
  "review": { ... },
  "flashcard": { ... },
  "schedule": {
    "nextReview": "2024-01-15T00:00:00.000Z",
    "interval": 6,
    "repetitions": 2,
    "easeFactor": 2.6
  }
}
```

### Getting Due Cards

**GET** `/api/review/due`

Query parameters:
- `deckId` (optional): Filter by specific deck
- `limit` (optional): Maximum number of cards

Response:
```json
{
  "flashcards": [...],
  "stats": {
    "total": 25,
    "new": 10,
    "learning": 8,
    "review": 7
  },
  "count": 25
}
```

## Learning Stages

Cards progress through different learning stages:

1. **New** (repetitions = 0): Never reviewed
2. **Learning** (repetitions 1-2): Short intervals (1-6 days)
3. **Young** (repetitions ≥ 3, interval < 21 days): Growing intervals
4. **Mature** (interval ≥ 21 days): Long intervals, well-learned

## Example Review Flow

Let's walk through reviewing a new card:

**Initial state:**
- Ease Factor: 2.5
- Interval: 0
- Repetitions: 0

**Day 1 - First review, rated "Good" (3):**
- New interval: 1 day
- New repetitions: 1
- Next review: Tomorrow

**Day 2 - Second review, rated "Good" (3):**
- New interval: 6 days
- New repetitions: 2
- Next review: 6 days from now

**Day 8 - Third review, rated "Easy" (5):**
- Ease factor increases to ~2.6
- New interval: 6 × 2.6 = 16 days
- New repetitions: 3
- Next review: 16 days from now

**Day 24 - Fourth review, rated "Hard" (2):**
- Ease factor decreases to ~2.38
- New interval: 16 × 2.38 = 38 days
- New repetitions: 4
- Next review: 38 days from now

**Day 62 - Fifth review, rated "Wrong" (0):**
- Interval resets to 1 day
- Repetitions reset to 0
- Next review: Tomorrow (start over)

## Tips for Users

### For Best Results:

1. **Be Honest**: Rate cards based on actual recall difficulty
2. **Review Daily**: Check for due cards each day
3. **Don't Skip**: Skipping reviews can lead to forgetting
4. **Trust the System**: Even if intervals seem long, the algorithm optimizes retention

### Rating Guidelines:

- **Wrong**: Couldn't recall at all
- **Hard**: Recalled but with significant struggle
- **Good**: Recalled with minor effort (most common)
- **Easy**: Instant, effortless recall

## Benefits of SM-2

1. **Optimized Learning**: Reviews at the optimal time for retention
2. **Efficiency**: Less time spent on well-known cards
3. **Long-term Retention**: Gradually increases intervals to build lasting memory
4. **Adaptive**: Adjusts to individual card difficulty

## Integration Points

### Frontend Components

- `components/flashcards/study-session.tsx`: Displays review interface
- Shows estimated next review interval for each rating button
- Displays toast notifications with next review date

### Backend

- `lib/spaced-repetition.ts`: Core algorithm implementation
- `app/api/decks/[deckId]/flashcards/[flashcardId]/review/route.ts`: Review endpoint
- `app/api/review/due/route.ts`: Due cards endpoint

## Future Enhancements

Potential improvements to the spaced repetition system:

1. **FSRS Algorithm**: Upgrade to the more modern FSRS (Free Spaced Repetition Scheduler)
2. **Daily Limits**: Set maximum reviews per day
3. **Advanced Statistics**: Retention rates, learning curves, and forecasts
4. **Review Heatmap**: Visual calendar showing review history
5. **Card Suspension**: Ability to pause cards temporarily
6. **Bulk Rescheduling**: Adjust multiple cards at once
7. **Optimal Times**: Suggest best times of day for reviews
8. **Filtered Decks**: Create custom review queues

## References

- [SuperMemo 2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [Spaced Repetition on Wikipedia](https://en.wikipedia.org/wiki/Spaced_repetition)
- [FSRS Algorithm](https://github.com/open-spaced-repetition/fsrs4anki)

---

**Implementation Date**: 2024
**Algorithm Version**: SM-2 (SuperMemo 2)
**Minimum Ease Factor**: 1.3
**Default Ease Factor**: 2.5
