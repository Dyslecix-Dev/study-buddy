import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { calculateNextReview, mapRatingToQuality } from '@/lib/spaced-repetition'
import { incrementDailyProgress } from '@/lib/progress-tracker'
import { logFlashcardReviewed } from '@/lib/activity-logger'
import { awardXP } from '@/lib/gamification-service'
import { XP_VALUES } from '@/lib/gamification'
import { checkActionBasedAchievements, checkDailyChallenges, checkCountBasedAchievements, updateDailyProgress } from '@/lib/achievement-helpers'

type Params = {
  params: Promise<{
    deckId: string
    flashcardId: string
  }>
}

// POST /api/decks/[deckId]/flashcards/[flashcardId]/review - Record a review for a flashcard
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { deckId, flashcardId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the deck belongs to the user
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: user.id,
      },
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    const body = await request.json()
    const { rating } = body // 0, 2, 3, or 5 (wrong, hard, good, easy)

    if (rating === undefined || ![0, 2, 3, 5].includes(rating)) {
      return NextResponse.json(
        { error: 'Rating must be 0, 2, 3, or 5' },
        { status: 400 }
      )
    }

    // Get current flashcard data
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
    })

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    // Map UI rating to SM-2 quality value
    const quality = mapRatingToQuality(rating as 0 | 2 | 3 | 5)

    // Calculate next review schedule using SM-2 algorithm
    const scheduleResult = calculateNextReview(
      {
        easeFactor: flashcard.easeFactor,
        interval: flashcard.interval,
        repetitions: flashcard.repetitions,
        lastReviewed: flashcard.lastReviewed,
        nextReview: flashcard.nextReview,
      },
      quality
    )

    // Create review record
    const review = await prisma.review.create({
      data: {
        flashcardId: flashcardId,
        quality: quality,
      },
    })

    // Update flashcard with new SM-2 scheduling data
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        easeFactor: scheduleResult.easeFactor,
        interval: scheduleResult.interval,
        repetitions: scheduleResult.repetitions,
        nextReview: scheduleResult.nextReview,
        lastReviewed: new Date(),
      },
    })

    // Track progress - card has been reviewed
    await incrementDailyProgress(user.id, 'cardReviewed')

    // Gamification: Award XP and track streak
    try {
      const isCorrect = quality >= 3 // quality from spaced repetition
      const xpAmount = isCorrect ? XP_VALUES.REVIEW_FLASHCARD_CORRECT : XP_VALUES.REVIEW_FLASHCARD

      await awardXP(user.id, xpAmount)

      // Update daily progress
      await updateDailyProgress(user.id, { cardsReviewed: 1 })

      // Track review streak for perfect-recall achievement
      if (isCorrect) {
        await prisma.userProgress.update({
          where: { userId: user.id },
          data: {
            currentReviewStreak: { increment: 1 },
            longestReviewStreak: { increment: 1 },
          },
        })
      } else {
        await prisma.userProgress.update({
          where: { userId: user.id },
          data: { currentReviewStreak: 0 },
        })
      }

      // Check achievements
      await checkActionBasedAchievements(user.id)
      await checkDailyChallenges(user.id)
      await checkCountBasedAchievements(user.id)
    } catch (gamificationError) {
      console.error('Gamification error:', gamificationError)
    }

    // Log activity
    await logFlashcardReviewed(user.id, flashcardId, deck.name)

    return NextResponse.json(
      {
        review,
        flashcard: updatedFlashcard,
        schedule: {
          nextReview: scheduleResult.nextReview,
          interval: scheduleResult.interval,
          repetitions: scheduleResult.repetitions,
          easeFactor: scheduleResult.easeFactor,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error recording review:', error)
    return NextResponse.json({ error: 'Failed to record review' }, { status: 500 })
  }
}
