import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS, getAchievementsByCategory, AchievementCategory } from "@/lib/gamification";
import { AchievementsPageClient } from "./achievements-client";
import DashboardNav from "@/components/dashboard-nav";
import { LoadingSpinner } from "@/components/loading-spinner";

export const metadata = {
  title: "Achievements | Study Buddy",
  description: "View your earned achievements and track your progress",
};

async function getAchievementsData(userId: string) {
  // Get user progress
  const userProgress = await prisma.userProgress.findUnique({
    where: { userId },
  });

  // Get user achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      Achievement: true,
    },
    orderBy: { unlockedAt: "desc" },
  });

  // Get counts for progress calculation
  const [
    notesCount,
    foldersCount,
    tasksCount,
    tasksCompletedCount,
    decksCount,
    cardsReviewedCount,
    examsCount,
    examsCompletedCount,
    questionsCount,
    focusMinutes,
    noteLinksCount,
    tagsUsedCount,
    bugReportsCount,
  ] = await Promise.all([
    prisma.note.count({ where: { userId } }),
    prisma.folder.count({ where: { userId } }),
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, completed: true } }),
    prisma.deck.count({ where: { userId } }),
    prisma.review.count({ where: { Flashcard: { Deck: { userId } } } }),
    prisma.exam.count({ where: { userId } }),
    prisma.examAttempt.count({ where: { userId, completedAt: { not: null } } }),
    prisma.question.aggregate({
      where: { Exam: { userId } },
      _count: true,
    }),
    prisma.focusSession.aggregate({
      where: { userId },
      _sum: { duration: true },
    }),
    prisma.noteLink.count({ where: { Note_NoteLink_fromNoteIdToNote: { userId } } }),
    prisma.tag.count({ where: { userId } }),
    prisma.activityLog.count({ where: { userId, type: "bug_report" } }),
  ]);

  const progressData = {
    notes: notesCount,
    folders: foldersCount,
    tasks: tasksCount,
    tasksCompleted: tasksCompletedCount,
    decks: decksCount,
    cardsReviewed: cardsReviewedCount,
    exams: examsCount,
    examsCompleted: examsCompletedCount,
    questions: questionsCount._count,
    studyMinutes: focusMinutes._sum.duration || 0,
    studyHours: Math.floor((focusMinutes._sum.duration || 0) / 60),
    noteLinks: noteLinksCount,
    tagsUsed: tagsUsedCount,
    bugReports: bugReportsCount,
    level: userProgress?.level || 1,
    currentStreak: userProgress?.currentStreak || 0,
  };

  return {
    userProgress,
    userAchievements,
    progressData,
  };
}

export default async function AchievementsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { userProgress, userAchievements, progressData } = await getAchievementsData(user.id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Achievements</h1>
            <p className="text-muted-foreground">Track your progress and unlock badges</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Unlocked</p>
            <p className="text-2xl font-bold">
              {userAchievements.length} / {ACHIEVEMENTS.length}
            </p>
          </div>
        </div>

        {/* Client Component with Achievements */}
        <Suspense fallback={<LoadingSpinner />}>
          <AchievementsPageClient userProgress={userProgress} userAchievements={userAchievements} progressData={progressData} />
        </Suspense>
      </div>
    </div>
  );
}

