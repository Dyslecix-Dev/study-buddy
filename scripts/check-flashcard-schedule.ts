/**
 * Check flashcard scheduling data in the database
 * Run with: npx tsx scripts/check-flashcard-schedule.ts
 */

import { prisma } from '../lib/prisma'
import { getIntervalDescription, getCardStatistics } from '../lib/spaced-repetition'

async function checkSchedules() {
  console.log('📊 Checking Flashcard Schedules\n')
  console.log('=' .repeat(70))

  // Get all flashcards with their deck info
  const flashcards = await prisma.flashcard.findMany({
    include: {
      Deck: {
        select: {
          name: true,
        },
      },
      Review: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 20, // Show last 20 flashcards
  })

  if (flashcards.length === 0) {
    console.log('No flashcards found in database.')
    console.log('\nCreate some flashcards and review them to test the spaced repetition system!')
    return
  }

  console.log(`Found ${flashcards.length} flashcards:\n`)

  for (const card of flashcards) {
    const stats = getCardStatistics({
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      lastReviewed: card.lastReviewed,
      nextReview: card.nextReview,
    })

    console.log(`\nDeck: ${card.Deck.name}`)
    console.log(`Front: ${card.front.substring(0, 50)}${card.front.length > 50 ? '...' : ''}`)
    console.log(`Back: ${card.back.substring(0, 50)}${card.back.length > 50 ? '...' : ''}`)
    console.log('-'.repeat(70))
    console.log(`  Stage: ${stats.stage.toUpperCase()}`)
    console.log(`  Reviews: ${stats.reviewCount}`)
    console.log(`  Current Interval: ${stats.currentInterval} days`)
    console.log(`  Ease Factor: ${card.easeFactor.toFixed(2)}`)
    console.log(`  Next Review: ${stats.nextReviewIn}`)
    console.log(`  Due Now: ${stats.isDue ? '✅ Yes' : '❌ No'}`)

    if (card.lastReviewed) {
      const lastReview = new Date(card.lastReviewed)
      console.log(`  Last Reviewed: ${lastReview.toLocaleString()}`)
    }

    if (card.Review && card.Review.length > 0) {
      console.log(`  Last Rating: ${card.Review[0].quality}`)
    }
  }

  // Summary statistics
  console.log('\n' + '='.repeat(70))
  console.log('Summary:')
  console.log('-'.repeat(70))

  const newCards = flashcards.filter(c => c.repetitions === 0)
  const learningCards = flashcards.filter(c => c.repetitions > 0 && c.repetitions < 3)
  const youngCards = flashcards.filter(c => c.repetitions >= 3 && c.interval < 21)
  const matureCards = flashcards.filter(c => c.interval >= 21)

  console.log(`  New: ${newCards.length}`)
  console.log(`  Learning: ${learningCards.length}`)
  console.log(`  Young: ${youngCards.length}`)
  console.log(`  Mature: ${matureCards.length}`)

  const dueCards = flashcards.filter(c => {
    if (!c.nextReview) return true
    return new Date(c.nextReview) <= new Date()
  })

  console.log(`  Due for review: ${dueCards.length}`)

  await prisma.$disconnect()
}

checkSchedules().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
