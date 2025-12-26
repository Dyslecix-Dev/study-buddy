-- AlterTable
ALTER TABLE "DailyProgress" ADD COLUMN     "questionsAnswered" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "currentReviewStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "earlyTaskCompletions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "longestReviewStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDecksCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalExamsCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalFoldersCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLinksCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalNotesCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalQuestionsCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalTagsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalTasksCreated" INTEGER NOT NULL DEFAULT 0;
