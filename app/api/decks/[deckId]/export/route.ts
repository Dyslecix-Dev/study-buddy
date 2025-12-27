import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { exportDeckAsCSV } from "@/lib/export-utils";

type Params = {
  params: Promise<{
    deckId: string;
  }>;
};

// GET /api/decks/[deckId]/export - Export deck as CSV (Anki-compatible)
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { deckId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch deck with flashcards
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: user.id,
      },
      include: {
        Flashcard: {
          orderBy: { createdAt: "asc" },
          include: {
            Tag: true,
          },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (deck.Flashcard.length === 0) {
      return NextResponse.json(
        { error: "No flashcards to export in this deck" },
        { status: 400 }
      );
    }

    // Convert deck to export format
    const deckData = {
      id: deck.id,
      name: deck.name,
      description: deck.description || undefined,
      color: deck.color || undefined,
      createdAt: deck.createdAt.toISOString(),
      flashcards: deck.Flashcard.map((card) => ({
        id: card.id,
        front: card.front as any,
        back: card.back as any,
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        nextReview: card.nextReview?.toISOString(),
        lastReviewed: card.lastReviewed?.toISOString(),
        createdAt: card.createdAt.toISOString(),
        tags: card.Tag.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
        })),
      })),
    };

    // Generate CSV content
    const csv = exportDeckAsCSV(deckData);

    // Return as file download
    const filename = `${deck.name.replace(/[^a-z0-9]/gi, "_")}_flashcards_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting deck:", error);
    return NextResponse.json(
      { error: "Failed to export deck" },
      { status: 500 }
    );
  }
}
