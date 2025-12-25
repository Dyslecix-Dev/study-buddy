import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logExamUpdated, logExamDeleted } from "@/lib/activity-logger";

type Params = {
  params: Promise<{
    examId: string;
  }>;
};

// GET /api/exams/[examId] - Get a specific exam with questions
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

    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: user.id,
      },
      include: {
        Question: {
          orderBy: { createdAt: "asc" },
          include: {
            Tag: true,
          },
        },
        _count: {
          select: { Question: true },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}

// PATCH /api/exams/[examId] - Update an exam
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { examId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    // Verify the exam belongs to the user
    const existingExam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: user.id,
      },
    });

    if (!existingExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;

    const exam = await prisma.exam.update({
      where: { id: examId },
      data: updateData,
      include: {
        _count: {
          select: { Question: true },
        },
      },
    });

    // Log activity
    await logExamUpdated(user.id, exam.id, exam.name);

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
  }
}

// DELETE /api/exams/[examId] - Delete an exam
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { examId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the exam belongs to the user and get all questions with tags
    const existingExam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: user.id,
      },
      include: {
        Question: {
          include: {
            Tag: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!existingExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Collect all tag IDs from questions in this exam
    const tagIds = new Set<string>();
    existingExam.Question.forEach((question) => {
      question.Tag.forEach((tag) => {
        tagIds.add(tag.id);
      });
    });

    // Log activity before deletion
    await logExamDeleted(user.id, existingExam.name);

    // Delete the exam (this will cascade delete all questions)
    await prisma.exam.delete({
      where: { id: examId },
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
    console.error("Error deleting exam:", error);
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
  }
}

