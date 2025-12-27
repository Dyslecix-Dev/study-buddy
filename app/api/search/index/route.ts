import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { indexNote, indexTask, indexFlashcard, indexFolder, indexTag, deleteFromIndex, indexAllUserContent } from "@/lib/search-indexing";

// POST /api/search/index - Index a specific document
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
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
    }

    // Index the document based on type
    switch (type) {
      case "note":
        await indexNote(id, user.id);
        break;
      case "task":
        await indexTask(id, user.id);
        break;
      case "flashcard":
        await indexFlashcard(id, user.id);
        break;
      case "folder":
        await indexFolder(id, user.id);
        break;
      case "tag":
        await indexTag(id, user.id);
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Indexed ${type}: ${id}` });
  } catch (error) {
    console.error("Error indexing document:", error);
    return NextResponse.json({ error: "Failed to index document" }, { status: 500 });
  }
}

// DELETE /api/search/index - Delete a document from index
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
    }

    await deleteFromIndex(type as any, id);

    return NextResponse.json({ success: true, message: `Deleted ${type}: ${id}` });
  } catch (error) {
    console.error("Error deleting from index:", error);
    return NextResponse.json({ error: "Failed to delete from index" }, { status: 500 });
  }
}

// PUT /api/search/index - Reindex all user content
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await indexAllUserContent(user.id);

    return NextResponse.json({ success: true, message: "All content reindexed" });
  } catch (error) {
    console.error("Error reindexing content:", error);
    return NextResponse.json({ error: "Failed to reindex content" }, { status: 500 });
  }
}
