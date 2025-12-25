import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logQuestionUpdated, logQuestionDeleted } from "@/lib/activity-logger";

type Params = {
  params: Promise<{
    examId: string;
    questionId: string;
  }>;
};

// GET /api/exams/[examId]/questions/[questionId] - Get a specific question
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { examId, questionId } = await params;
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

    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        examId,
      },
      include: {
        Tag: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}

// PATCH /api/exams/[examId]/questions/[questionId] - Update a question
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { examId, questionId } = await params;
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

    // Get existing question with tags
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: questionId,
        examId,
      },
      include: {
        Tag: {
          select: { id: true },
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    if (question !== undefined) updateData.question = question;
    if (questionType !== undefined) {
      const validTypes = ["multiple_choice", "select_all", "true_false"];
      if (!validTypes.includes(questionType)) {
        return NextResponse.json({ error: "Invalid question type" }, { status: 400 });
      }
      updateData.questionType = questionType;
    }
    if (options !== undefined) {
      const parsedOptions = Array.isArray(options) ? options : JSON.parse(options);
      const finalQuestionType = questionType || existingQuestion.questionType;

      if (finalQuestionType === "true_false" && parsedOptions.length !== 2) {
        return NextResponse.json({ error: "True/False questions must have exactly 2 options" }, { status: 400 });
      }
      if ((finalQuestionType === "multiple_choice" || finalQuestionType === "select_all") && (parsedOptions.length < 2 || parsedOptions.length > 5)) {
        return NextResponse.json({ error: "Multiple choice and select all questions must have 2-5 options" }, { status: 400 });
      }

      updateData.options = parsedOptions;
    }

    // Handle tag updates
    if (tagIds !== undefined) {
      const currentTagIds = existingQuestion.Tag.map((tag) => tag.id);
      const newTagIds = tagIds || [];
      const removedTagIds = currentTagIds.filter((id) => !newTagIds.includes(id));

      updateData.Tag = {
        set: newTagIds.map((id: string) => ({ id })),
      };

      // Clean up removed tags if they're not used elsewhere
      for (const tagId of removedTagIds) {
        const tagWithUsage = await prisma.tag.findUnique({
          where: { id: tagId },
          include: {
            _count: {
              select: {
                Note: true,
                Task: true,
                Flashcard: true,
                Question: true,
              },
            },
          },
        });

        if (tagWithUsage) {
          // Count will still include this question, so check if it's the only one
          const totalUsage = tagWithUsage._count.Note + tagWithUsage._count.Task + tagWithUsage._count.Flashcard + tagWithUsage._count.Question;
          if (totalUsage === 1) {
            await prisma.tag.delete({
              where: { id: tagId },
            });
          }
        }
      }
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: updateData,
      include: {
        Tag: true,
      },
    });

    // Log activity
    await logQuestionUpdated(user.id, updatedQuestion.id, exam.name);

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

// DELETE /api/exams/[examId]/questions/[questionId] - Delete a question
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { examId, questionId } = await params;
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

    // Get the question with tags before deletion
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: questionId,
        examId,
      },
      include: {
        Tag: {
          select: { id: true },
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const tagIds = existingQuestion.Tag.map((tag) => tag.id);

    // Log activity before deletion
    await logQuestionDeleted(user.id, exam.name);

    // Delete the question
    await prisma.question.delete({
      where: { id: questionId },
    });

    // Clean up orphaned tags
    for (const tagId of tagIds) {
      const tagWithUsage = await prisma.tag.findUnique({
        where: { id: tagId },
        include: {
          _count: {
            select: {
              Note: true,
              Task: true,
              Flashcard: true,
              Question: true,
            },
          },
        },
      });

      if (tagWithUsage) {
        const totalUsage = tagWithUsage._count.Note + tagWithUsage._count.Task + tagWithUsage._count.Flashcard + tagWithUsage._count.Question;
        if (totalUsage === 0) {
          await prisma.tag.delete({
            where: { id: tagId },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
