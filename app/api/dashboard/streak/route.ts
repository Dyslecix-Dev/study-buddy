import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

// GET /api/dashboard/streak - Get active days for streak calendar
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get timezone offset from query params (in minutes)
    const { searchParams } = new URL(request.url);
    const timezoneOffset = parseInt(searchParams.get("offset") || "0");

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Get all days with ANY activity in the current month
    const [focusSessions, reviews, completedTasks, notes] = await Promise.all([
      // Focus sessions (Pomodoro)
      prisma.focusSession.findMany({
        where: {
          userId: user.id,
          completedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          completedAt: true,
        },
      }),
      // Flashcard reviews
      prisma.review.findMany({
        where: {
          Flashcard: {
            Deck: {
              userId: user.id,
            },
          },
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          createdAt: true,
        },
      }),
      // Completed tasks
      prisma.task.findMany({
        where: {
          userId: user.id,
          completed: true,
          updatedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          updatedAt: true,
        },
      }),
      // Created/updated notes
      prisma.note.findMany({
        where: {
          userId: user.id,
          updatedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          updatedAt: true,
        },
      }),
    ]);

    // Helper function to format date with timezone adjustment
    const formatDateWithTimezone = (timestamp: Date): string => {
      const utcDate = new Date(timestamp);
      const localDate = new Date(utcDate.getTime() - timezoneOffset * 60 * 1000);

      const year = localDate.getUTCFullYear();
      const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(localDate.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Extract unique days with activity from all sources
    const activeDays = new Set<string>();

    // Add focus session dates
    focusSessions.forEach((session) => {
      activeDays.add(formatDateWithTimezone(session.completedAt));
    });

    // Add review dates
    reviews.forEach((review) => {
      activeDays.add(formatDateWithTimezone(review.createdAt));
    });

    // Add task completion dates
    completedTasks.forEach((task) => {
      activeDays.add(formatDateWithTimezone(task.updatedAt));
    });

    // Add note activity dates
    notes.forEach((note) => {
      activeDays.add(formatDateWithTimezone(note.updatedAt));
    });

    return NextResponse.json({
      activeDays: Array.from(activeDays),
    });
  } catch (error) {
    console.error("Error fetching streak data:", error);
    return NextResponse.json({ error: "Failed to fetch streak data" }, { status: 500 });
  }
}

