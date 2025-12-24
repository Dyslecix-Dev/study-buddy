/**
 * Migration script to convert existing flashcard front/back text fields to JSON format
 * This preserves existing data when migrating from String to Json type
 *
 * Run with: npx tsx scripts/migrate-flashcards-to-json.ts
 */

import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

async function migrateFlashcardsToJson() {
  console.log('Starting flashcard migration to JSON format...')

  try {
    // Get all flashcards
    const flashcards = await prisma.$queryRaw<Array<{
      id: string
      front: string | object
      back: string | object
    }>>`SELECT id, front, back FROM "Flashcard"`

    console.log(`Found ${flashcards.length} flashcards to migrate`)

    let migratedCount = 0
    let skippedCount = 0

    for (const flashcard of flashcards) {
      // Check if already in JSON format
      if (typeof flashcard.front === 'object' && typeof flashcard.back === 'object') {
        console.log(`Skipping flashcard ${flashcard.id} - already in JSON format`)
        skippedCount++
        continue
      }

      // Convert plain text to TipTap JSON format
      const frontJson = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: flashcard.front ? [
              {
                type: 'text',
                text: String(flashcard.front)
              }
            ] : []
          }
        ]
      }

      const backJson = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: flashcard.back ? [
              {
                type: 'text',
                text: String(flashcard.back)
              }
            ] : []
          }
        ]
      }

      // Update the flashcard with JSON data
      await prisma.$executeRaw`
        UPDATE "Flashcard"
        SET front = ${JSON.stringify(frontJson)}::jsonb,
            back = ${JSON.stringify(backJson)}::jsonb
        WHERE id = ${flashcard.id}
      `

      migratedCount++
      console.log(`Migrated flashcard ${flashcard.id}`)
    }

    console.log('\nMigration complete!')
    console.log(`✓ Migrated: ${migratedCount}`)
    console.log(`- Skipped: ${skippedCount}`)
    console.log(`Total: ${flashcards.length}`)

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateFlashcardsToJson()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
