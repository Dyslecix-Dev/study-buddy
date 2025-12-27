import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/search/history - Get user's search history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    const history = await prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching search history:", error);
    return NextResponse.json({ error: "Failed to fetch search history" }, { status: 500 });
  }
}

// POST /api/search/history - Save a search to history
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
    const { query, filters, resultCount } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Create search history entry
    const searchHistory = await prisma.searchHistory.create({
      data: {
        userId: user.id,
        query,
        filters: filters || null,
        resultCount: resultCount || 0,
      },
    });

    // Keep only the last 50 searches per user
    const allHistory = await prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (allHistory.length > 50) {
      const idsToDelete = allHistory.slice(50).map((h) => h.id);
      await prisma.searchHistory.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });
    }

    return NextResponse.json({ success: true, searchHistory });
  } catch (error) {
    console.error("Error saving search history:", error);
    return NextResponse.json({ error: "Failed to save search history" }, { status: 500 });
  }
}

// DELETE /api/search/history - Clear search history
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
    const id = searchParams.get("id");

    if (id) {
      // Delete specific search history item
      await prisma.searchHistory.delete({
        where: { id, userId: user.id },
      });
    } else {
      // Delete all search history for user
      await prisma.searchHistory.deleteMany({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting search history:", error);
    return NextResponse.json({ error: "Failed to delete search history" }, { status: 500 });
  }
}
