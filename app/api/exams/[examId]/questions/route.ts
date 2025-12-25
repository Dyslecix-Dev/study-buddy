import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logQuestionCreated } from "@/lib/activity-logger";
import { incrementDailyProgress } from "@/lib/progress-tracker";

type Params = {
  params: Promise<{
    examId: string;
  }>;
};

// GET /api/exams/[examId]/questions - Get all questions in an exam
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

    const questions = await prisma.question.findMany({
      where: { examId },
      orderBy: { createdAt: "asc" },
      include: {
        Tag: true,
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

// POST /api/exams/[examId]/questions - Create a new question
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

    const body = await request.json();
    const { question, questionType, options, tagIds } = body;

    if (!question || !questionType || !options) {
      return NextResponse.json({ error: "Question, questionType, and options are required" }, { status: 400 });
    }

    // Validate questionType
    const validTypes = ["multiple_choice", "select_all", "true_false"];
    if (!validTypes.includes(questionType)) {
      return NextResponse.json({ error: "Invalid question type" }, { status: 400 });
    }

    // Validate options based on questionType
    const parsedOptions = Array.isArray(options) ? options : JSON.parse(options);
    if (questionType === "true_false" && parsedOptions.length !== 2) {
      return NextResponse.json({ error: "True/False questions must have exactly 2 options" }, { status: 400 });
    }
    if ((questionType === "multiple_choice" || questionType === "select_all") && (parsedOptions.length < 2 || parsedOptions.length > 5)) {
      return NextResponse.json({ error: "Multiple choice and select all questions must have 2-5 options" }, { status: 400 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        question,
        questionType,
        options: parsedOptions,
        examId,
        Tag:
          tagIds && tagIds.length > 0
            ? {
                connect: tagIds.map((id: string) => ({ id })),
              }
            : undefined,
      },
      include: {
        Tag: true,
      },
    });

    // Log activity
    await logQuestionCreated(user.id, newQuestion.id, exam.name);

    // Track daily progress
    await incrementDailyProgress(user.id, "questionCreated");

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
