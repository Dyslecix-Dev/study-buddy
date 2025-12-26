import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { logFolderCreated } from "@/lib/activity-logger";
import { awardXP } from "@/lib/gamification-service";
import { XP_VALUES } from "@/lib/gamification";
import { checkCountBasedAchievements } from "@/lib/achievement-helpers";

// GET /api/folders - Get all folders for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folders = await prisma.folder.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { Note: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

// POST /api/folders - Create a new folder
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

    const folder = await prisma.folder.create({
      data: {
        id: randomUUID(),
        name,
        description,
        color,
        userId: user.id,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: { Note: true },
        },
      },
    });

    // Gamification: Award XP and track
    try {
      await awardXP(user.id, XP_VALUES.CREATE_FOLDER);

      await prisma.userProgress.upsert({
        where: { userId: user.id },
        create: { userId: user.id, totalFoldersCreated: 1 },
        update: { totalFoldersCreated: { increment: 1 } },
      });

      await checkCountBasedAchievements(user.id);
    } catch (gamificationError) {
      console.error("Gamification error:", gamificationError);
    }

    // Log activity
    await logFolderCreated(user.id, folder.id, folder.name);

    return NextResponse.json(folder, { status: 201 });
  } catch (error: any) {
    console.error("Error creating folder:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A folder with this name already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

