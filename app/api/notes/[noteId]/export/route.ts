import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { exportSingleNoteAsMarkdown } from "@/lib/export-utils";

type Params = Promise<{
  noteId: string;
}>;

// GET /api/notes/[noteId]/export - Export a single note as Markdown
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { noteId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch note
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: user.id,
      },
      include: {
        Tag: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Convert note to export format
    const noteData = {
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
    };

    // Generate Markdown content
    const markdown = exportSingleNoteAsMarkdown(noteData);

    // Return as file download
    const filename = `${note.title.replace(/[^a-z0-9]/gi, "_")}_${
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
    console.error("Error exporting note:", error);
    return NextResponse.json(
      { error: "Failed to export note" },
      { status: 500 }
    );
  }
}
