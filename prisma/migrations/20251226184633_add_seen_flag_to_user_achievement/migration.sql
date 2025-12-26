-- AlterTable
ALTER TABLE "UserAchievement" ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "UserAchievement_userId_seen_idx" ON "UserAchievement"("userId", "seen");
