/**
 * Create a mature flashcard example for testing
 * Run with: npx tsx scripts/create-mature-card-example.ts
 */

import { prisma } from '../lib/prisma'

async function createMatureExample() {
  console.log('🎯 Creating a mature card example...\n')

  // Get the first flashcard
  const card = await prisma.flashcard.findFirst()

  if (!card) {
    console.log('No flashcards found. Please create some flashcards first.')
    return
  }

  // Update it to be a mature card
  const updatedCard = await prisma.flashcard.update({
    where: { id: card.id },
    data: {
      easeFactor: 2.8,
      interval: 45,
      repetitions: 8,
      lastReviewed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      nextReview: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday (due now)
    },
  })

  console.log('✅ Created mature card example:')
  console.log('  ID:', updatedCard.id)
  console.log('  Front:', updatedCard.front)
  console.log('  Repetitions:', updatedCard.repetitions)
  console.log('  Interval:', updatedCard.interval, 'days')
  console.log('  Ease Factor:', updatedCard.easeFactor)
  console.log('  Next Review: Due now!')
  console.log('\nNow run: npx tsx scripts/check-flashcard-schedule.ts')

  await prisma.$disconnect()
}

createMatureExample().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
