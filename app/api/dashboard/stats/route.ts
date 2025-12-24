import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths, eachDayOfInterval, format } from 'date-fns'

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // 'day', 'week', 'month'

    // Calculate date ranges
    const now = new Date()
    const todayStart = startOfDay(now)
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)

    let periodStart: Date
    let comparisonStart: Date

    switch (period) {
      case 'day':
        periodStart = todayStart
        comparisonStart = subDays(todayStart, 1)
        break
      case 'month':
        periodStart = monthStart
        comparisonStart = subMonths(monthStart, 1)
        break
      case 'week':
      default:
        periodStart = weekStart
        comparisonStart = subWeeks(weekStart, 1)
        break
    }

    // Fetch all statistics in parallel
    const [
      totalNotes,
      totalTasks,
      completedTasks,
      totalFlashcards,
      totalDecks,
      reviewsCount,
      totalFocusMinutes,
      focusSessions,
      studySessions,
      recentActivity,
    ] = await Promise.all([
      // Total notes
      prisma.note.count({
        where: { userId: user.id },
      }),

      // Total tasks
      prisma.task.count({
        where: { userId: user.id },
      }),

      // Completed tasks in period - use DailyProgress for permanent tracking
      prisma.dailyProgress.aggregate({
        where: {
          userId: user.id,
          date: { gte: periodStart },
        },
        _sum: {
          tasksCompleted: true,
        },
      }).then(result => result._sum.tasksCompleted || 0),

      // Total flashcards
      prisma.flashcard.count({
        where: {
          Deck: {
            userId: user.id,
          },
        },
      }),

      // Total decks
      prisma.deck.count({
        where: { userId: user.id },
      }),

      // Reviews in period - use DailyProgress for permanent tracking
      prisma.dailyProgress.aggregate({
        where: {
          userId: user.id,
          date: { gte: periodStart },
        },
        _sum: {
          cardsReviewed: true,
        },
      }).then(result => result._sum.cardsReviewed || 0),

      // Focus minutes in period - use DailyProgress for permanent tracking
      prisma.dailyProgress.aggregate({
        where: {
          userId: user.id,
          date: { gte: periodStart },
        },
        _sum: {
          focusMinutes: true,
        },
      }).then(result => result._sum.focusMinutes || 0),

      // Focus sessions (for recent activity display)
      prisma.focusSession.findMany({
        where: {
          userId: user.id,
          completedAt: { gte: periodStart },
        },
        orderBy: { completedAt: 'desc' },
      }),

      // Study sessions
      prisma.studySession.findMany({
        where: {
          userId: user.id,
          startedAt: { gte: periodStart },
        },
        orderBy: { startedAt: 'desc' },
      }),

      // Recent activity from ActivityLog (last 20 items)
      prisma.activityLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    // Calculate total study time
    const totalStudyMinutes = studySessions.reduce((sum, session) => sum + session.duration, 0)

    // Calculate streak (consecutive days with focus sessions)
    const streak = await calculateStreak(user.id, now)

    // Prepare activity chart data
    const activityData = await prepareActivityChartData(user.id, periodStart, now, period)

    console.log(`📊 Dashboard stats for ${period}:`, {
      totalFocusMinutes,
      completedTasks,
      reviewsCount,
      streak,
      activityData: activityData.map(d => ({
        date: d.date,
        focusMinutes: d.focusMinutes,
        tasksCompleted: d.tasksCompleted,
        cardsReviewed: d.cardsReviewed,
      })),
    })

    // Format activity log for frontend
    const formattedActivity = recentActivity.map(activity => ({
      id: activity.id,
      type: activity.type,
      entityType: activity.entityType,
      entityId: activity.entityId,
      title: activity.title,
      timestamp: activity.createdAt,
      metadata: activity.metadata,
    }))

    return NextResponse.json({
      period,
      overview: {
        totalNotes,
        totalTasks,
        completedTasks,
        totalFlashcards,
        totalDecks,
        reviewsCount,
        totalFocusMinutes,
        totalStudyMinutes,
        streak,
      },
      activityData,
      recentActivity: formattedActivity,
      focusSessions: focusSessions.slice(0, 10),
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 })
  }
}

// Calculate study streak - counts ANY activity (focus, reviews, tasks, notes)
async function calculateStreak(userId: string, currentDate: Date): Promise<number> {
  let streak = 0
  let checkDate = startOfDay(currentDate)
  let checkedToday = false

  while (true) {
    const dayEnd = new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)

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
    ])

    const progressActivity = dailyProgress
      ? (dailyProgress.tasksCompleted + dailyProgress.cardsReviewed + dailyProgress.notesCreated + dailyProgress.notesUpdated)
      : 0
    const activityOnDay = focusSessions + progressActivity + updatedNotes
    const isToday = checkDate.getTime() === startOfDay(currentDate).getTime()

    if (activityOnDay > 0) {
      streak++
      checkedToday = isToday
      checkDate = subDays(checkDate, 1)
    } else {
      // If we're checking today and there's no activity yet, don't break the streak
      // Just move to yesterday and continue checking
      if (isToday && !checkedToday) {
        checkedToday = true
        checkDate = subDays(checkDate, 1)
        continue
      }
      // No activity on this day and it's not "today with no activity yet" - streak is broken
      break
    }

    // Limit check to prevent infinite loop
    if (streak > 365) break
  }

  return streak
}

// Prepare activity chart data
async function prepareActivityChartData(
  userId: string,
  startDate: Date,
  endDate: Date,
  period: string
) {
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const dailyData = await Promise.all(
    days.map(async (day) => {
      const dayStart = startOfDay(day)

      // Get progress data from DailyProgress table for permanent tracking
      const dailyProgress = await prisma.dailyProgress.findUnique({
        where: {
          userId_date: {
            userId,
            date: dayStart,
          },
        },
      })

      return {
        date: format(day, 'MMM dd'),
        fullDate: format(day, 'yyyy-MM-dd'),
        focusMinutes: dailyProgress?.focusMinutes || 0,
        tasksCompleted: dailyProgress?.tasksCompleted || 0,
        cardsReviewed: dailyProgress?.cardsReviewed || 0,
      }
    })
  )

  return dailyData
}
