import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logDeckCreated } from "@/lib/activity-logger";

// GET /api/decks - Get all decks for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decks = await prisma.deck.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { Flashcard: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(decks);
  } catch (error) {
    console.error("Error fetching decks:", error);
    return NextResponse.json({ error: "Failed to fetch decks" }, { status: 500 });
  }
}

// POST /api/decks - Create a new deck
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
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const deck = await prisma.deck.create({
      data: {
        name,
        description: description || null,
        color: color || null,
        userId: user.id,
      },
      include: {
        _count: {
          select: { Flashcard: true },
        },
      },
    });

    // Log activity
    await logDeckCreated(user.id, deck.id, deck.name);

    return NextResponse.json(deck, { status: 201 });
  } catch (error: any) {
    console.error("Error creating deck:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A deck with this name already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create deck" }, { status: 500 });
  }
}

