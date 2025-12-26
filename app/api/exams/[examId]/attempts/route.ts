import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logExamCompleted } from "@/lib/activity-logger";
import { incrementDailyProgress } from "@/lib/progress-tracker";
import { awardXP } from "@/lib/gamification-service";
import { XP_VALUES } from "@/lib/gamification";
import { checkActionBasedAchievements, checkDailyChallenges, checkPerfectScore, updateDailyProgress } from "@/lib/achievement-helpers";

type Params = {
  params: Promise<{
    examId: string;
  }>;
};

// GET /api/exams/[examId]/attempts - Get all attempts for an exam
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { examId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the exam belongs to the user
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: user.id,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId,
        userId: user.id,
      },
      orderBy: { startedAt: "desc" },
      include: {
        QuestionResult: {
          include: {
            Question: true,
          },
        },
      },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Error fetching exam attempts:", error);
    return NextResponse.json({ error: "Failed to fetch exam attempts" }, { status: 500 });
  }
}

// POST /api/exams/[examId]/attempts - Submit an exam attempt
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { examId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the exam belongs to the user and get questions
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: user.id,
      },
      include: {
        Question: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.Question.length === 0) {
      return NextResponse.json({ error: "Cannot take an exam with no questions" }, { status: 400 });
    }

    const body = await request.json();
    const { answers } = body; // answers is an array of { questionId, userAnswer }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    // Calculate score
    let correctCount = 0;
    const questionResults = [];

    for (const answer of answers) {
      const question = exam.Question.find((q) => q.id === answer.questionId);
      if (!question) continue;

      const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options as any);
      let isCorrect = false;

      if (question.questionType === "multiple_choice") {
        // For multiple choice, userAnswer is a single index
        const correctIndex = options.findIndex((opt: any) => opt.isCorrect);
        isCorrect = answer.userAnswer === correctIndex;
      } else if (question.questionType === "select_all") {
        // For select all, userAnswer is an array of indices
        const correctIndices = options
          .map((opt: any, idx: number) => (opt.isCorrect ? idx : -1))
          .filter((idx: number) => idx !== -1)
          .sort();
        const userIndices = Array.isArray(answer.userAnswer) ? [...answer.userAnswer].sort() : [];
        isCorrect = JSON.stringify(correctIndices) === JSON.stringify(userIndices);
      } else if (question.questionType === "true_false") {
        // For true/false, userAnswer is a boolean or index (0 or 1)
        const correctIndex = options.findIndex((opt: any) => opt.isCorrect);
        isCorrect = answer.userAnswer === correctIndex;
      }

      if (isCorrect) correctCount++;

      questionResults.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect,
      });
    }

    const totalQuestions = exam.Question.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Create exam attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        userId: user.id,
        score,
        totalQuestions,
        correctAnswers: correctCount,
        completedAt: new Date(),
        QuestionResult: {
          create: questionResults,
        },
      },
      include: {
        QuestionResult: {
          include: {
            Question: true,
          },
        },
      },
    });

    // Gamification: Award XP
    try {
      await awardXP(user.id, XP_VALUES.COMPLETE_EXAM);

      // Bonus XP for perfect score
      if (attempt.score === 100) {
        await awardXP(user.id, XP_VALUES.PERFECT_EXAM);
      }

      // Update daily progress
      await updateDailyProgress(user.id, {
        examsCompleted: 1,
        questionsAnswered: attempt.totalQuestions,
      });

      // Check achievements
      await checkActionBasedAchievements(user.id);
      await checkDailyChallenges(user.id);
      await checkPerfectScore(user.id, attempt.id);
    } catch (gamificationError) {
      console.error("Gamification error:", gamificationError);
    }

    // Log activity
    await logExamCompleted(user.id, exam.id, exam.name, score);

    // Track daily progress
    await incrementDailyProgress(user.id, "examCompleted");

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("Error creating exam attempt:", error);
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
  }
}
