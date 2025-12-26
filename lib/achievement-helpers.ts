import { prisma } from "@/lib/prisma";
import { checkAndUnlockAchievement } from "./gamification-service";

/**
 * Check all count-based achievements for a user
 * Call this after updating cumulative counters
 */
export async function checkCountBasedAchievements(userId: string) {
  try {
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!progress) return;

    // Notes achievements
    if (progress.totalNotesCreated >= 1) {
      await checkAndUnlockAchievement(userId, "first-note");
    }
    if (progress.totalNotesCreated >= 10) {
      await checkAndUnlockAchievement(userId, "notes-10");
    }
    if (progress.totalNotesCreated >= 50) {
      await checkAndUnlockAchievement(userId, "notes-50");
    }
    if (progress.totalNotesCreated >= 100) {
      await checkAndUnlockAchievement(userId, "notes-100");
    }
    if (progress.totalNotesCreated >= 500) {
      await checkAndUnlockAchievement(userId, "notes-500");
    }

    // Folder achievements
    if (progress.totalFoldersCreated >= 1) {
      await checkAndUnlockAchievement(userId, "first-folder");
    }
    if (progress.totalFoldersCreated >= 10) {
      await checkAndUnlockAchievement(userId, "folder-master");
    }

    // Tag achievements
    if (progress.totalTagsUsed >= 1) {
      await checkAndUnlockAchievement(userId, "first-tag");
    }
    if (progress.totalTagsUsed >= 50) {
      await checkAndUnlockAchievement(userId, "tag-master");
    }

    // Task achievements
    if (progress.totalTasksCreated >= 1) {
      await checkAndUnlockAchievement(userId, "first-task");
    }

    // Deck achievements
    if (progress.totalDecksCreated >= 1) {
      await checkAndUnlockAchievement(userId, "first-deck");
    }
    if (progress.totalDecksCreated >= 10) {
      await checkAndUnlockAchievement(userId, "deck-collector");
    }

    // Exam achievements
    if (progress.totalExamsCreated >= 1) {
      await checkAndUnlockAchievement(userId, "exam-creator");
    }
    if (progress.totalQuestionsCreated >= 50) {
      await checkAndUnlockAchievement(userId, "question-master");
    }

    // Review streak achievements
    if (progress.currentReviewStreak >= 20) {
      await checkAndUnlockAchievement(userId, "perfect-recall");
    }

    // Early bird achievement
    if (progress.earlyTaskCompletions >= 10) {
      await checkAndUnlockAchievement(userId, "early-bird");
    }
  } catch (error) {
    console.error("Error checking count-based achievements:", error);
  }
}

/**
 * Check daily challenge achievements
 */
export async function checkDailyChallenges(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: { userId, date: today },
      },
    });

    if (!dailyProgress) return;

    // Productivity Sprint
    if (dailyProgress.tasksCompleted >= 10) {
      await checkAndUnlockAchievement(userId, "productivity-sprint");
    }

    // Speed Learner
    if (dailyProgress.cardsReviewed >= 50) {
      await checkAndUnlockAchievement(userId, "speed-learner");
    }

    // Exam Daily Challenge
    if (dailyProgress.questionsAnswered >= 20) {
      await checkAndUnlockAchievement(userId, "exam-daily-challenge");
    }
  } catch (error) {
    console.error("Error checking daily challenges:", error);
  }
}

/**
 * Check action-based achievements (cards reviewed, tasks completed, etc.)
 */
export async function checkActionBasedAchievements(userId: string) {
  try {
    // Count completed tasks
    const tasksCompleted = await prisma.task.count({
      where: { userId, completed: true },
    });

    if (tasksCompleted >= 10) await checkAndUnlockAchievement(userId, "tasks-completed-10");
    if (tasksCompleted >= 50) await checkAndUnlockAchievement(userId, "tasks-completed-50");
    if (tasksCompleted >= 100) await checkAndUnlockAchievement(userId, "tasks-completed-100");
    if (tasksCompleted >= 500) await checkAndUnlockAchievement(userId, "tasks-completed-500");

    // Count flashcard reviews
    const reviewsCount = await prisma.review.count({
      where: {
        Flashcard: {
          Deck: { userId },
        },
      },
    });

    if (reviewsCount >= 100) await checkAndUnlockAchievement(userId, "cards-reviewed-100");
    if (reviewsCount >= 500) await checkAndUnlockAchievement(userId, "cards-reviewed-500");
    if (reviewsCount >= 1000) await checkAndUnlockAchievement(userId, "cards-reviewed-1000");
    if (reviewsCount >= 5000) await checkAndUnlockAchievement(userId, "cards-reviewed-5000");

    // Count completed exams
    const examsCompleted = await prisma.examAttempt.count({
      where: { userId, completedAt: { not: null } },
    });

    if (examsCompleted >= 1) await checkAndUnlockAchievement(userId, "first-exam");
    if (examsCompleted >= 10) await checkAndUnlockAchievement(userId, "exams-completed-10");
    if (examsCompleted >= 50) await checkAndUnlockAchievement(userId, "exams-completed-50");

    // Count study hours
    const studyMinutes = await prisma.focusSession.aggregate({
      where: { userId },
      _sum: { duration: true },
    });

    const totalMinutes = studyMinutes._sum.duration || 0;

    if (totalMinutes >= 1) await checkAndUnlockAchievement(userId, "first-study-session");
    if (totalMinutes >= 600) await checkAndUnlockAchievement(userId, "study-hours-10");
    if (totalMinutes >= 3000) await checkAndUnlockAchievement(userId, "study-hours-50");
    if (totalMinutes >= 6000) await checkAndUnlockAchievement(userId, "study-hours-100");
    if (totalMinutes >= 30000) await checkAndUnlockAchievement(userId, "study-hours-500");

    // Check level achievements
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (progress) {
      if (progress.level >= 10) await checkAndUnlockAchievement(userId, "level-10");
      if (progress.level >= 25) await checkAndUnlockAchievement(userId, "level-25");
      if (progress.level >= 50) await checkAndUnlockAchievement(userId, "level-50");
      if (progress.level >= 100) await checkAndUnlockAchievement(userId, "level-100");

      // Check streak achievements
      if (progress.currentStreak >= 3) await checkAndUnlockAchievement(userId, "streak-3");
      if (progress.currentStreak >= 7) await checkAndUnlockAchievement(userId, "streak-7");
      if (progress.currentStreak >= 30) await checkAndUnlockAchievement(userId, "streak-30");
      if (progress.currentStreak >= 100) await checkAndUnlockAchievement(userId, "streak-100");
      if (progress.currentStreak >= 200) await checkAndUnlockAchievement(userId, "streak-200");
      if (progress.currentStreak >= 365) await checkAndUnlockAchievement(userId, "streak-365");
    }
  } catch (error) {
    console.error("Error checking action-based achievements:", error);
  }
}

/**
 * Check compound achievements (require multiple conditions)
 */
export async function checkCompoundAchievements(userId: string) {
  try {
    // Priority Master - completed tasks of all priority levels
    const priorities = await prisma.task.groupBy({
      by: ["priority"],
      where: { userId, completed: true },
      _count: { priority: true },
    });

    const hasPriorities = priorities.map((p) => p.priority);
    // Assuming 0=low, 1=medium, 2=high or similar numeric priority values
    if (hasPriorities.length >= 3) {
      await checkAndUnlockAchievement(userId, "priority-master");
    }

    // Well-Rounded Learner - use all 5 main features
    const [hasNotes, hasTasks, hasDecks, hasExams, hasStudy] = await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.task.count({ where: { userId } }),
      prisma.deck.count({ where: { userId } }),
      prisma.exam.count({ where: { userId } }),
      prisma.focusSession.count({ where: { userId } }),
    ]);

    if (hasNotes > 0 && hasTasks > 0 && hasDecks > 0 && hasExams > 0 && hasStudy > 0) {
      await checkAndUnlockAchievement(userId, "well-rounded");
    }

    // Power User - level 20 + 100 completed tasks
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });
    const tasksCompleted = await prisma.task.count({
      where: { userId, completed: true },
    });

    if (progress && progress.level >= 20 && tasksCompleted >= 100) {
      await checkAndUnlockAchievement(userId, "power-user");
    }
  } catch (error) {
    console.error("Error checking compound achievements:", error);
  }
}

/**
 * Check if exam has perfect score
 */
export async function checkPerfectScore(userId: string, examAttemptId: string) {
  try {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: examAttemptId },
    });

    if (attempt && attempt.score === 100) {
      await checkAndUnlockAchievement(userId, "perfect-exam");
    }
  } catch (error) {
    console.error("Error checking perfect score:", error);
  }
}

/**
 * Check if exam uses all question types
 */
export async function checkVarietyExpert(userId: string, examId: string) {
  try {
    const questionTypes = await prisma.question.groupBy({
      by: ["questionType"],
      where: { examId },
      _count: { questionType: true },
    });

    const types = questionTypes.map((qt) => qt.questionType);

    // Check if has all 3 types: multiple_choice, select_all, true_false
    if (types.includes("multiple_choice") && types.includes("select_all") && types.includes("true_false")) {
      await checkAndUnlockAchievement(userId, "variety-expert");
    }
  } catch (error) {
    console.error("Error checking variety expert:", error);
  }
}

/**
 * Check first day achievement
 */
export async function checkFirstDay(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const createdDate = new Date(user.createdAt);
    createdDate.setHours(0, 0, 0, 0);

    // Only check on first day
    if (today.getTime() !== createdDate.getTime()) return;

    // Count actions today via daily progress
    const dailyProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: { userId, date: today },
      },
    });

    if (!dailyProgress) return;

    const totalActions = dailyProgress.notesCreated + dailyProgress.tasksCompleted + dailyProgress.cardsReviewed + dailyProgress.examsCompleted + dailyProgress.focusMinutes > 0 ? 1 : 0; // Count any focus time as 1 action

    if (totalActions >= 5) {
      await checkAndUnlockAchievement(userId, "first-day");
    }
  } catch (error) {
    console.error("Error checking first day:", error);
  }
}

/**
 * Helper to update daily progress
 */
export async function updateDailyProgress(
  userId: string,
  updates: Partial<{
    tasksCompleted: number;
    cardsReviewed: number;
    notesCreated: number;
    notesUpdated: number;
    focusMinutes: number;
    examsCompleted: number;
    questionsCreated: number;
    questionsAnswered: number;
  }>
) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const incrementData: Record<string, { increment: number }> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        incrementData[key] = { increment: value };
      }
    }

    await prisma.dailyProgress.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      create: {
        userId,
        date: today,
        ...updates,
      },
      update: incrementData,
    });
  } catch (error) {
    console.error("Error updating daily progress:", error);
  }
}

