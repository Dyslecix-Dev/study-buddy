import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logFolderUpdated, logFolderDeleted } from "@/lib/activity-logger";

type Params = Promise<{
  folderId: string;
}>;

// GET /api/folders/[folderId] - Get a specific folder with its notes
export async function GET({ params }: { params: Params }) {
  try {
    const { folderId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: user.id,
      },
      include: {
        Note: {
          orderBy: { updatedAt: "desc" },
          include: {
            Tag: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json({ error: "Failed to fetch folder" }, { status: 500 });
  }
}

// PATCH /api/folders/[folderId] - Update a folder
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const { folderId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: user.id,
      },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
      },
      include: {
        _count: {
          select: { Note: true },
        },
      },
    });

    // Log activity
    await logFolderUpdated(user.id, folder.id, folder.name);

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}

// DELETE /api/folders/[folderId] - Delete a folder
export async function DELETE({ params }: { params: Params }) {
  try {
    const { folderId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: user.id,
      },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Get all notes in this folder with their tags
    const notesInFolder = await prisma.note.findMany({
      where: { folderId: folderId },
      include: {
        Tag: {
          select: { id: true },
        },
      },
    });

    // Collect all tag IDs from notes in this folder
    const tagIds = new Set<string>();
    notesInFolder.forEach((note) => {
      note.Tag.forEach((tag) => {
        tagIds.add(tag.id);
      });
    });

    // Delete all notes in this folder
    await prisma.note.deleteMany({
      where: { folderId: folderId },
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
            },
          },
        },
      });

      if (tagWithUsage) {
        const totalUsage = tagWithUsage._count.Note + tagWithUsage._count.Task + tagWithUsage._count.Flashcard;
        if (totalUsage === 0) {
          await prisma.tag.delete({
            where: { id: tagId },
          });
        }
      }
    }

    // Log activity before deletion
    await logFolderDeleted(user.id, existingFolder.name);

    // Delete the folder
    await prisma.folder.delete({
      where: { id: folderId },
    });

    return NextResponse.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}

