/**
 * Check flashcard scheduling data in the database
 * Run with: npx tsx scripts/check-flashcard-schedule.ts
 */

import { prisma } from '../lib/prisma'
import { getCardStatistics } from '../lib/spaced-repetition'

async function checkSchedules() {
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
    return
  }

  for (const card of flashcards) {
    getCardStatistics({
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      lastReviewed: card.lastReviewed,
      nextReview: card.nextReview,
    })
  }

  // Summary statistics
  flashcards.filter(c => c.repetitions === 0)
  flashcards.filter(c => c.repetitions > 0 && c.repetitions < 3)
  flashcards.filter(c => c.repetitions >= 3 && c.interval < 21)
  flashcards.filter(c => c.interval >= 21)

  flashcards.filter(c => {
    if (!c.nextReview) return true
    return new Date(c.nextReview) <= new Date()
  })

  await prisma.$disconnect()
}

checkSchedules().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
