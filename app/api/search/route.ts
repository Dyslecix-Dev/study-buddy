import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/search - Get all searchable content for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch folders, notes, tasks, flashcards, and tags in parallel
    const [folders, notes, tasks, decks, tags] = await Promise.all([
      prisma.folder.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
        },
      }),
      prisma.note.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          content: true,
          folderId: true,
          createdAt: true,
          updatedAt: true,
          Tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      }),
      prisma.task.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          dueDate: true,
          priority: true,
          Tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      }),
      prisma.deck.findMany({
        where: { userId: user.id },
        include: {
          Flashcard: {
            select: {
              id: true,
              front: true,
              back: true,
              Tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      }),
      prisma.tag.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          color: true,
          _count: {
            select: {
              Note: true,
              Task: true,
              Flashcard: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      folders,
      notes,
      tasks,
      decks,
      tags,
    });
  } catch (error) {
    console.error("Error fetching search data:", error);
    return NextResponse.json({ error: "Failed to fetch search data" }, { status: 500 });
  }
}

