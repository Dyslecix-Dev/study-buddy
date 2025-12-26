import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logExamCreated } from "@/lib/activity-logger";
import { awardXP } from "@/lib/gamification-service";
import { XP_VALUES } from "@/lib/gamification";
import { checkCountBasedAchievements, checkCompoundAchievements } from "@/lib/achievement-helpers";

// GET /api/exams - Get all exams for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exams = await prisma.exam.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { Question: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

// POST /api/exams - Create a new exam
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        name,
        description: description || null,
        color: color || null,
        userId: user.id,
      },
      include: {
        _count: {
          select: { Question: true },
        },
      },
    });

    // Gamification: Award XP and track
    try {
      await awardXP(user.id, XP_VALUES.CREATE_EXAM);

      await prisma.userProgress.upsert({
        where: { userId: user.id },
        create: { userId: user.id, totalExamsCreated: 1 },
        update: { totalExamsCreated: { increment: 1 } },
      });

      await checkCountBasedAchievements(user.id);
      await checkCompoundAchievements(user.id);
    } catch (gamificationError) {
      console.error("Gamification error:", gamificationError);
    }

    // Log activity
    await logExamCreated(user.id, exam.id, exam.name);

    return NextResponse.json(exam, { status: 201 });
  } catch (error: any) {
    console.error("Error creating exam:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json({ error: "An exam with this name already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
