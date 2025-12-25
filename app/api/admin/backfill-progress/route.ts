import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, eachDayOfInterval } from "date-fns";

/**
 * Backfill endpoint to populate DailyProgress with historical data
 * This should be called once after deploying the new DailyProgress feature
 *
 * GET /api/admin/backfill-progress
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the earliest activity date for this user
    const [earliestTask, earliestReview] = await Promise.all([
      prisma.task.findFirst({
        where: { userId: user.id, completed: true },
        orderBy: { updatedAt: "asc" },
        select: { updatedAt: true },
      }),
      prisma.review.findFirst({
        where: {
          Flashcard: {
            Deck: {
              userId: user.id,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
    ]);

    const dates = [earliestTask?.updatedAt, earliestReview?.createdAt].filter(Boolean) as Date[];

    if (dates.length === 0) {
      return NextResponse.json({
        message: "No historical data found",
        recordsCreated: 0,
        recordsUpdated: 0,
      });
    }

    const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const today = new Date();

    // Generate all days from earliest activity to today
    const days = eachDayOfInterval({ start: earliestDate, end: today });

    let recordsCreated = 0;
    const recordsUpdated = 0;

    for (const day of days) {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      // Get completed tasks for this day
      const tasksCompleted = await prisma.task.count({
        where: {
          userId: user.id,
          completed: true,
          updatedAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

      // Get reviews for this day
      const cardsReviewed = await prisma.review.count({
        where: {
          Flashcard: {
            Deck: {
              userId: user.id,
            },
          },
          createdAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

      // Only create record if there was activity
      if (tasksCompleted > 0 || cardsReviewed > 0) {
        const existing = await prisma.dailyProgress.findUnique({
          where: {
            userId_date: {
              userId: user.id,
              date: dayStart,
            },
          },
        });

        if (existing) {
          // Skip - don't overwrite existing progress data
          // Existing data is more accurate as it was tracked in real-time
          continue;
        } else {
          // Create new record only if it doesn't exist
          await prisma.dailyProgress.create({
            data: {
              userId: user.id,
              date: dayStart,
              tasksCompleted,
              cardsReviewed,
              notesCreated: 0,
              notesUpdated: 0,
            },
          });
          recordsCreated++;
        }
      }
    }

    return NextResponse.json({
      message: "Backfill completed successfully",
      daysProcessed: days.length,
      recordsCreated,
      recordsUpdated,
      earliestDate: earliestDate.toISOString(),
    });
  } catch (error) {
    console.error("Error during backfill:", error);
    return NextResponse.json({ error: "Failed to backfill progress data" }, { status: 500 });
  }
}

