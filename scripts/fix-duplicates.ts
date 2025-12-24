import { prisma } from '../lib/prisma.ts'

async function fixDuplicates() {
  // Use raw SQL to rename duplicates efficiently
  await prisma.$executeRaw`
    WITH ranked_folders AS (
      SELECT
        id,
        name,
        "userId",
        ROW_NUMBER() OVER (PARTITION BY "userId", name ORDER BY "createdAt") as rn
      FROM "Folder"
    )
    UPDATE "Folder"
    SET name = CONCAT(rf.name, ' (', rf.rn, ')')
    FROM ranked_folders rf
    WHERE "Folder".id = rf.id AND rf.rn > 1
  `

  await prisma.$executeRaw`
    WITH ranked_decks AS (
      SELECT
        id,
        name,
        "userId",
        ROW_NUMBER() OVER (PARTITION BY "userId", name ORDER BY "createdAt") as rn
      FROM "Deck"
    )
    UPDATE "Deck"
    SET name = CONCAT(rd.name, ' (', rd.rn, ')')
    FROM ranked_decks rd
    WHERE "Deck".id = rd.id AND rd.rn > 1
  `

  await prisma.$executeRaw`
    WITH ranked_notes AS (
      SELECT
        id,
        title,
        "userId",
        ROW_NUMBER() OVER (PARTITION BY "userId", title ORDER BY "createdAt") as rn
      FROM "Note"
    )
    UPDATE "Note"
    SET title = CONCAT(rn.title, ' (', rn.rn, ')')
    FROM ranked_notes rn
    WHERE "Note".id = rn.id AND rn.rn > 1
  `
}

fixDuplicates()
  .catch((e) => {
    console.error('Error fixing duplicates:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
