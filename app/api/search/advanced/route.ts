import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { advancedSearch, SearchFilters } from "@/lib/advanced-search";

// GET /api/search/advanced - Perform advanced search with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") as SearchFilters["type"] | null;
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    const completed = searchParams.get("completed");
    const priority = searchParams.get("priority");
    const folderId = searchParams.get("folderId");
    const deckId = searchParams.get("deckId");
    const dueDateFrom = searchParams.get("dueDateFrom");
    const dueDateTo = searchParams.get("dueDateTo");
    const createdFrom = searchParams.get("createdFrom");
    const createdTo = searchParams.get("createdTo");

    // Build filters object
    const filters: SearchFilters = {};
    if (type) filters.type = type;
    if (tags && tags.length > 0) filters.tags = tags;
    if (completed !== null) filters.completed = completed === "true";
    if (priority !== null) filters.priority = parseInt(priority);
    if (folderId) filters.folderId = folderId;
    if (deckId) filters.deckId = deckId;
    if (dueDateFrom) filters.dueDateFrom = new Date(dueDateFrom);
    if (dueDateTo) filters.dueDateTo = new Date(dueDateTo);
    if (createdFrom) filters.createdFrom = new Date(createdFrom);
    if (createdTo) filters.createdTo = new Date(createdTo);

    // Perform search
    const results = await advancedSearch(query, user.id, filters);

    return NextResponse.json({
      query,
      filters,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("Error performing advanced search:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
