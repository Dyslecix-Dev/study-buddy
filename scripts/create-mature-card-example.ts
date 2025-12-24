/**
 * Create a mature flashcard example for testing
 * Run with: npx tsx scripts/create-mature-card-example.ts
 */

import { prisma } from '../lib/prisma'

async function createMatureExample() {
  // Get the first flashcard
  const card = await prisma.flashcard.findFirst()

  if (!card) {
    return
  }

  // Update it to be a mature card
  await prisma.flashcard.update({
    where: { id: card.id },
    data: {
      easeFactor: 2.8,
      interval: 45,
      repetitions: 8,
      lastReviewed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      nextReview: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday (due now)
    },
  })

  await prisma.$disconnect()
}

createMatureExample().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
