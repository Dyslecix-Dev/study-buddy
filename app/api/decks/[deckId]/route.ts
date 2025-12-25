import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logDeckUpdated, logDeckDeleted } from "@/lib/activity-logger";

type Params = {
  params: Promise<{
    deckId: string;
  }>;
};

// GET /api/decks/[deckId] - Get a specific deck with flashcards
export async function GET({ params }: Params) {
  try {
    const { deckId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        _count: {
          select: { Flashcard: true },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json(deck);
  } catch (error) {
    console.error("Error fetching deck:", error);
    return NextResponse.json({ error: "Failed to fetch deck" }, { status: 500 });
  }
}

// PATCH /api/decks/[deckId] - Update a deck
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { deckId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    // Verify the deck belongs to the user
    const existingDeck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: user.id,
      },
    });

    if (!existingDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;

    const deck = await prisma.deck.update({
      where: { id: deckId },
      data: updateData,
      include: {
        _count: {
          select: { Flashcard: true },
        },
      },
    });

    // Log activity
    await logDeckUpdated(user.id, deck.id, deck.name);

    return NextResponse.json(deck);
  } catch (error) {
    console.error("Error updating deck:", error);
    return NextResponse.json({ error: "Failed to update deck" }, { status: 500 });
  }
}

// DELETE /api/decks/[deckId] - Delete a deck
export async function DELETE({ params }: Params) {
  try {
    const { deckId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the deck belongs to the user and get all flashcards with tags
    const existingDeck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: user.id,
      },
      include: {
        Flashcard: {
          include: {
            Tag: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!existingDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Collect all tag IDs from flashcards in this deck
    const tagIds = new Set<string>();
    existingDeck.Flashcard.forEach((flashcard) => {
      flashcard.Tag.forEach((tag) => {
        tagIds.add(tag.id);
      });
    });

    // Log activity before deletion
    await logDeckDeleted(user.id, existingDeck.name);

    // Delete the deck (this will cascade delete all flashcards)
    await prisma.deck.delete({
      where: { id: deckId },
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting deck:", error);
    return NextResponse.json({ error: "Failed to delete deck" }, { status: 500 });
  }
}

