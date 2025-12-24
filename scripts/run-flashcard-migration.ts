/**
 * Run database migration to convert Flashcard front/back to JSONB
 *
 * Run with: npx tsx scripts/run-flashcard-migration.ts
 */

import { prisma } from '../lib/prisma'

async function runMigration() {
  console.log('Starting database migration: Convert Flashcard to JSONB...')

  try {
    // Step 1: Add temporary columns
    console.log('Step 1: Adding temporary columns...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Flashcard" ADD COLUMN IF NOT EXISTS "front_new" JSONB;
    `)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Flashcard" ADD COLUMN IF NOT EXISTS "back_new" JSONB;
    `)

    // Step 2: Migrate existing data to JSON format
    console.log('Step 2: Converting existing data to TipTap JSON format...')
    await prisma.$executeRawUnsafe(`
      UPDATE "Flashcard"
      SET
        "front_new" = jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', CASE
                WHEN "front" IS NOT NULL AND "front" != '' THEN
                  jsonb_build_array(jsonb_build_object('type', 'text', 'text', "front"))
                ELSE
                  '[]'::jsonb
              END
            )
          )
        ),
        "back_new" = jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', CASE
                WHEN "back" IS NOT NULL AND "back" != '' THEN
                  jsonb_build_array(jsonb_build_object('type', 'text', 'text', "back"))
                ELSE
                  '[]'::jsonb
              END
            )
          )
        )
      WHERE "front_new" IS NULL OR "back_new" IS NULL;
    `)

    // Step 3: Drop old columns
    console.log('Step 3: Dropping old text columns...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Flashcard" DROP COLUMN IF EXISTS "front";
    `)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Flashcard" DROP COLUMN IF EXISTS "back";
    `)

    // Step 4: Rename new columns
    console.log('Step 4: Renaming columns...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Flashcard" RENAME COLUMN "front_new" TO "front";
    `)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Flashcard" RENAME COLUMN "back_new" TO "back";
    `)

    // Step 5: Set NOT NULL constraints
    console.log('Step 5: Adding NOT NULL constraints...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Flashcard" ALTER COLUMN "front" SET NOT NULL;
    `)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Flashcard" ALTER COLUMN "back" SET NOT NULL;
    `)

    console.log('\n✓ Migration completed successfully!')

    // Verify migration
    const count = await prisma.flashcard.count()
    console.log(`\nVerified: ${count} flashcards in database`)

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

runMigration()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
