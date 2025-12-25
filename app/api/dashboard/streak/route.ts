import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format } from "date-fns";

// GET /api/dashboard/streak - Get active days for streak calendar (only consecutive streak days)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Calculate the current streak and get the dates
    const streakDates = await calculateStreakDates(user.id, now);

    return NextResponse.json({
      activeDays: streakDates,
    });
  } catch (error) {
    console.error("Error fetching streak data:", error);
    return NextResponse.json({ error: "Failed to fetch streak data" }, { status: 500 });
  }
}

// Calculate streak dates - returns array of YYYY-MM-DD strings for consecutive days with activity
async function calculateStreakDates(userId: string, currentDate: Date): Promise<string[]> {
  const streakDates: string[] = [];
  let checkDate = startOfDay(currentDate);
  let checkedToday = false;

  while (true) {
    const dayEnd = new Date(checkDate.getTime() + 24 * 60 * 60 * 1000);

    // Count ANY activity on this day using DailyProgress and FocusSession
    const [focusSessions, dailyProgress, updatedNotes] = await Promise.all([
      prisma.focusSession.count({
        where: {
          userId,
          completedAt: {
            gte: checkDate,
            lt: dayEnd,
          },
        },
      }),
      prisma.dailyProgress.findUnique({
        where: {
          userId_date: {
            userId,
            date: checkDate,
          },
        },
      }),
      prisma.note.count({
        where: {
          userId,
          updatedAt: {
            gte: checkDate,
            lt: dayEnd,
          },
        },
      }),
    ]);

    const progressActivity = dailyProgress
      ? dailyProgress.tasksCompleted +
        dailyProgress.cardsReviewed +
        dailyProgress.notesCreated +
        dailyProgress.notesUpdated +
        dailyProgress.examsCompleted +
        dailyProgress.questionsCreated
      : 0;
    const activityOnDay = focusSessions + progressActivity + updatedNotes;
    const isToday = checkDate.getTime() === startOfDay(currentDate).getTime();

    if (activityOnDay > 0) {
      // Add this date to streak dates
      streakDates.push(format(checkDate, "yyyy-MM-dd"));
      checkedToday = isToday;
      checkDate = subDays(checkDate, 1);
    } else {
      // If we're checking today and there's no activity yet, don't break the streak
      // Just move to yesterday and continue checking
      if (isToday && !checkedToday) {
        checkedToday = true;
        checkDate = subDays(checkDate, 1);
        continue;
      }
      // No activity on this day and it's not "today with no activity yet" - streak is broken
      break;
    }

    // Limit check to prevent infinite loop
    if (streakDates.length > 365) break;
  }

  return streakDates;
}

