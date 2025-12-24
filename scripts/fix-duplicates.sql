-- Fix duplicate folder names by appending a number to duplicates
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
WHERE "Folder".id = rf.id AND rf.rn > 1;

-- Fix duplicate deck names by appending a number to duplicates
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
WHERE "Deck".id = rd.id AND rd.rn > 1;
