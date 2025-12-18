import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{
  folderId: string;
}>;

// GET /api/folders/[folderId] - Get a specific folder with its notes
export async function GET(request: NextRequest, { params }: { params: Params }) {
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

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}

// DELETE /api/folders/[folderId] - Delete a folder
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
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

    // Delete all notes in this folder
    await prisma.note.deleteMany({
      where: { folderId: folderId },
    });

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
