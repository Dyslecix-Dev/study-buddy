/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on the SuperMemo 2 algorithm for optimal flashcard scheduling
 *
 * Quality ratings (0-5):
 * 0 - Total blackout, complete failure to recall
 * 1 - Incorrect response, but correct one seemed easy to recall
 * 2 - Incorrect response, correct one seemed hard to recall
 * 3 - Correct response, but required significant effort
 * 4 - Correct response, after some hesitation
 * 5 - Correct response with perfect recall
 */

export interface FlashcardData {
  easeFactor: number
  interval: number
  repetitions: number
  lastReviewed?: Date | null
  nextReview?: Date | null
}

export interface ReviewResult {
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: Date
}

/**
 * Calculate the next review schedule based on the SM-2 algorithm
 *
 * @param card - Current flashcard data with scheduling information
 * @param quality - Quality rating from 0-5 (user's self-assessment)
 * @returns Updated scheduling information for the flashcard
 */
export function calculateNextReview(
  card: FlashcardData,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): ReviewResult {
  let { easeFactor, interval, repetitions } = card

  // Update ease factor based on quality
  // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Minimum ease factor is 1.3
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  // Calculate new interval based on quality
  if (quality < 3) {
    // Failed recall - reset repetitions and start over
    repetitions = 0
    interval = 1
  } else {
    // Successful recall - increase interval
    repetitions += 1

    if (repetitions === 1) {
      // First successful repetition - review in 1 day
      interval = 1
    } else if (repetitions === 2) {
      // Second successful repetition - review in 6 days
      interval = 6
    } else {
      // Subsequent repetitions - multiply previous interval by ease factor
      interval = Math.round(interval * easeFactor)
    }
  }

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)
  // Set time to start of day for cleaner scheduling
  nextReview.setHours(0, 0, 0, 0)

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview,
  }
}

/**
 * Map user-friendly rating buttons to SM-2 quality values
 *
 * @param rating - Rating from UI (0=wrong, 2=hard, 3=good, 5=easy)
 * @returns SM-2 quality value (0-5)
 */
export function mapRatingToQuality(
  rating: 0 | 2 | 3 | 5
): 0 | 1 | 2 | 3 | 4 | 5 {
  // The UI uses simplified ratings, map them to SM-2 quality values
  switch (rating) {
    case 0:
      return 0 // Wrong - total blackout
    case 2:
      return 2 // Hard - correct but very difficult
    case 3:
      return 3 // Good - correct with some effort
    case 5:
      return 5 // Easy - perfect recall
    default:
      return 3 // Default to "good"
  }
}

/**
 * Get a human-readable description of the next review interval
 *
 * @param nextReview - Date of next review
 * @returns Human-readable string describing when the card will be reviewed again
 */
export function getIntervalDescription(nextReview: Date): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const diffTime = nextReview.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Later today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays < 7) {
    return `In ${diffDays} days`
  } else if (diffDays < 30) {
    const weeks = Math.round(diffDays / 7)
    return `In ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  } else if (diffDays < 365) {
    const months = Math.round(diffDays / 30)
    return `In ${months} ${months === 1 ? 'month' : 'months'}`
  } else {
    const years = Math.round(diffDays / 365)
    return `In ${years} ${years === 1 ? 'year' : 'years'}`
  }
}

/**
 * Check if a flashcard is due for review
 *
 * @param nextReview - Scheduled next review date
 * @returns True if the card should be reviewed now
 */
export function isDueForReview(nextReview: Date | null | undefined): boolean {
  if (!nextReview) {
    return true // Never reviewed, should be studied
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const reviewDate = new Date(nextReview)
  reviewDate.setHours(0, 0, 0, 0)

  return reviewDate <= now
}

/**
 * Get statistics about a flashcard's learning progress
 *
 * @param card - Flashcard data
 * @returns Object with learning statistics
 */
export function getCardStatistics(card: FlashcardData) {
  const { easeFactor, interval, repetitions, lastReviewed, nextReview } = card

  // Determine learning stage
  let stage: 'new' | 'learning' | 'young' | 'mature'
  if (repetitions === 0) {
    stage = 'new'
  } else if (repetitions < 3) {
    stage = 'learning'
  } else if (interval < 21) {
    stage = 'young'
  } else {
    stage = 'mature'
  }

  // Calculate retention difficulty (inverse of ease factor)
  const difficulty = Math.round((1 / easeFactor) * 100)

  return {
    stage,
    difficulty,
    reviewCount: repetitions,
    currentInterval: interval,
    nextReviewIn: nextReview ? getIntervalDescription(nextReview) : 'Not scheduled',
    isDue: isDueForReview(nextReview),
    lastReviewedDate: lastReviewed,
  }
}
