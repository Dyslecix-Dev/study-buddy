import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateExamQuestions, extractPlainText } from "@/lib/google-ai";
import { awardXP } from "@/lib/gamification-service";
import { XP_VALUES } from "@/lib/gamification";
import { incrementDailyProgress } from "@/lib/progress-tracker";

// POST - Generate exam questions from a note using AI
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { examId, examName, questionCount = 10, questionTypes } = await request.json();

    // Validate request
    if (!examId && !examName) {
      return NextResponse.json(
        { error: "Either examId or examName must be provided" },
        { status: 400 }
      );
    }

    if (questionCount < 1 || questionCount > 50) {
      return NextResponse.json(
        { error: "Question count must be between 1 and 50" },
        { status: 400 }
      );
    }

    // Validate question types if provided
    const validTypes = ["multiple_choice", "select_all", "true_false"];
    if (questionTypes && Array.isArray(questionTypes)) {
      for (const type of questionTypes) {
        if (!validTypes.includes(type)) {
          return NextResponse.json(
            { error: `Invalid question type: ${type}` },
            { status: 400 }
          );
        }
      }
    }

    // Fetch the note
    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Extract plain text from note content
    const plainText = extractPlainText(note.content as string);

    if (!plainText || plainText.length < 50) {
      return NextResponse.json(
        { error: "Note content is too short to generate exam questions. Please add more content." },
        { status: 400 }
      );
    }

    // Generate exam questions using Google AI
    let generatedQuestions;
    try {
      generatedQuestions = await generateExamQuestions(
        plainText,
        questionCount,
        questionTypes || ["multiple_choice", "select_all", "true_false"]
      );
    } catch (aiError: any) {
      console.error("AI generation error:", aiError);
      return NextResponse.json(
        { error: aiError.message || "Failed to generate exam questions using AI" },
        { status: 500 }
      );
    }

    // Get or create exam
    let exam;
    if (examId) {
      // Verify exam exists and belongs to user
      exam = await prisma.exam.findFirst({
        where: {
          id: examId,
          userId: user.id,
        },
      });

      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }
    } else {
      // Create new exam
      exam = await prisma.exam.create({
        data: {
          name: examName,
          description: `AI-generated exam from "${note.title}"`,
          userId: user.id,
        },
      });

      // Award XP for creating exam
      try {
        await awardXP(user.id, XP_VALUES.CREATE_EXAM);
      } catch (gamificationError) {
        console.error("Gamification error:", gamificationError);
      }
    }

    // Create questions in the exam
    const createdQuestions = await Promise.all(
      generatedQuestions.map(async (q) => {
        const question = await prisma.question.create({
          data: {
            question: q.question,
            questionType: q.questionType,
            options: q.options,
            examId: exam.id,
          },
        });

        return question;
      })
    );

    // Track daily progress
    await incrementDailyProgress(user.id, "questionsCreated", createdQuestions.length);

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        name: exam.name,
      },
      questions: createdQuestions,
      count: createdQuestions.length,
    });
  } catch (error: any) {
    console.error("Error generating exam questions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate exam questions" },
      { status: 500 }
    );
  }
}
