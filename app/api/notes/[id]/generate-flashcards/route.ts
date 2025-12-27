import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateFlashcards, extractPlainText } from "@/lib/google-ai";
import { logFlashcardCreated } from "@/lib/activity-logger";
import { awardXP } from "@/lib/gamification-service";
import { XP_VALUES } from "@/lib/gamification";
import { incrementDailyProgress } from "@/lib/progress-tracker";

// POST - Generate flashcards from a note using AI
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { deckId, deckName, count = 10 } = await request.json();

    // Validate request
    if (!deckId && !deckName) {
      return NextResponse.json(
        { error: "Either deckId or deckName must be provided" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 50) {
      return NextResponse.json(
        { error: "Count must be between 1 and 50" },
        { status: 400 }
      );
    }

    // Fetch the note
    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Extract plain text from note content
    const plainText = extractPlainText(note.content as string);

    if (!plainText || plainText.length < 50) {
      return NextResponse.json(
        { error: "Note content is too short to generate flashcards. Please add more content." },
        { status: 400 }
      );
    }

    // Generate flashcards using Google AI
    let flashcardPairs;
    try {
      flashcardPairs = await generateFlashcards(plainText, count);
    } catch (aiError: any) {
      console.error("AI generation error:", aiError);
      return NextResponse.json(
        { error: aiError.message || "Failed to generate flashcards using AI" },
        { status: 500 }
      );
    }

    // Get or create deck
    let deck;
    if (deckId) {
      // Verify deck exists and belongs to user
      deck = await prisma.deck.findFirst({
        where: {
          id: deckId,
          userId: user.id,
        },
      });

      if (!deck) {
        return NextResponse.json({ error: "Deck not found" }, { status: 404 });
      }
    } else {
      // Create new deck
      deck = await prisma.deck.create({
        data: {
          name: deckName,
          description: `AI-generated flashcards from "${note.title}"`,
          userId: user.id,
        },
      });
    }

    // Create flashcards in the deck
    const createdFlashcards = await Promise.all(
      flashcardPairs.map(async (pair) => {
        const flashcard = await prisma.flashcard.create({
          data: {
            front: `<p>${pair.front}</p>`, // Simple HTML wrapper for TipTap compatibility
            back: `<p>${pair.back}</p>`,
            deckId: deck.id,
          },
        });

        // Log activity for each flashcard created
        await logFlashcardCreated(user.id, flashcard.id, deck.id);

        // Award XP for creating flashcard
        try {
          await awardXP(user.id, XP_VALUES.CREATE_FLASHCARD);
        } catch (gamificationError) {
          console.error("Gamification error:", gamificationError);
        }

        return flashcard;
      })
    );

    // Track daily progress
    await incrementDailyProgress(user.id, "flashcardsCreated", createdFlashcards.length);

    return NextResponse.json({
      success: true,
      deck: {
        id: deck.id,
        name: deck.name,
      },
      flashcards: createdFlashcards,
      count: createdFlashcards.length,
    });
  } catch (error: any) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
