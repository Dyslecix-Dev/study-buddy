import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { deleteFlashcardImages } from "@/lib/blob-cleanup";

type Params = {
  params: Promise<{
    deckId: string;
    flashcardId: string;
  }>;
};

// GET /api/decks/[deckId]/flashcards/[flashcardId] - Get a specific flashcard
export async function GET({ params }: Params) {
  try {
    const { deckId, flashcardId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the deck belongs to the user
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: user.id,
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const flashcard = await prisma.flashcard.findFirst({
      where: {
        id: flashcardId,
        deckId,
      },
      include: {
        Tag: true,
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
    }

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    return NextResponse.json({ error: "Failed to fetch flashcard" }, { status: 500 });
  }
}

// PATCH /api/decks/[deckId]/flashcards/[flashcardId] - Update a flashcard
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { deckId, flashcardId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the deck belongs to the user
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: user.id,
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const body = await request.json();
    const { front, back, tagIds } = body;

    const updateData: any = {
      ...(front !== undefined && { front }),
      ...(back !== undefined && { back }),
    };

    // Handle tag updates
    let removedTagIds: string[] = [];
    if (tagIds !== undefined) {
      // Get current tags before update to determine which were removed
      const currentTagIds = await prisma.flashcard.findUnique({
        where: { id: flashcardId },
        select: {
          Tag: {
            select: { id: true },
          },
        },
      });

      if (currentTagIds) {
        const currentIds = currentTagIds.Tag.map((t) => t.id);
        removedTagIds = currentIds.filter((tagId) => !tagIds.includes(tagId));
      }

      updateData.Tag = {
        set: tagIds.map((id: string) => ({ id })),
      };
    }

    const flashcard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: updateData,
      include: {
        Tag: true,
      },
    });

    // Clean up unused tags
    for (const tagId of removedTagIds) {
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

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return NextResponse.json({ error: "Failed to update flashcard" }, { status: 500 });
  }
}

// DELETE /api/decks/[deckId]/flashcards/[flashcardId] - Delete a flashcard
export async function DELETE({ params }: Params) {
  try {
    const { deckId, flashcardId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the deck belongs to the user
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: user.id,
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Get tags before deletion for cleanup
    const flashcardWithTags = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      select: {
        Tag: {
          select: { id: true },
        },
      },
    });

    const tagIds = flashcardWithTags?.Tag.map((t) => t.id) || [];

    await prisma.flashcard.delete({
      where: { id: flashcardId },
    });

    // Clean up associated images from Vercel Blob
    await deleteFlashcardImages(user.id, flashcardId);

    // Clean up unused tags
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
    console.error("Error deleting flashcard:", error);
    return NextResponse.json({ error: "Failed to delete flashcard" }, { status: 500 });
  }
}

