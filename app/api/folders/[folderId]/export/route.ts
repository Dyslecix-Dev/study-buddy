import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { exportNotesAsMarkdown } from "@/lib/export-utils";

type Params = Promise<{
  folderId: string;
}>;

// GET /api/folders/[folderId]/export - Export all notes in a folder as Markdown
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

    // Fetch folder with notes
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: user.id,
      },
      include: {
        Note: {
          orderBy: { createdAt: "asc" },
          include: {
            Tag: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    if (folder.Note.length === 0) {
      return NextResponse.json(
        { error: "No notes to export in this folder" },
        { status: 400 }
      );
    }

    // Convert notes to export format
    const notesData = folder.Note.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content as any,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      tags: note.Tag.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })),
    }));

    // Generate Markdown content
    const markdown = exportNotesAsMarkdown(folder.name, notesData);

    // Return as file download
    const filename = `${folder.name.replace(/[^a-z0-9]/gi, "_")}_notes_${
      new Date().toISOString().split("T")[0]
    }.md`;

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting folder:", error);
    return NextResponse.json(
      { error: "Failed to export folder" },
      { status: 500 }
    );
  }
}
