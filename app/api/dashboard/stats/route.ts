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

      // Completed tasks in period
      prisma.task.count({
        where: {
          userId: user.id,
          completed: true,
          updatedAt: { gte: periodStart },
        },
      }),

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

      // Reviews in period
      prisma.review.count({
        where: {
          Flashcard: {
            Deck: {
              userId: user.id,
            },
          },
          createdAt: { gte: periodStart },
        },
      }),

      // Focus sessions
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

      // Recent activity (last 10 items)
      Promise.all([
        prisma.note.findMany({
          where: { userId: user.id },
          select: { id: true, title: true, createdAt: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
        prisma.task.findMany({
          where: { userId: user.id, completed: true, updatedAt: { gte: periodStart } },
          select: { id: true, title: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
        prisma.deck.findMany({
          where: { userId: user.id },
          select: { id: true, name: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
      ]),
    ])

    // Calculate total focus time
    const totalFocusMinutes = focusSessions.reduce((sum, session) => sum + session.duration, 0)

    // Calculate total study time
    const totalStudyMinutes = studySessions.reduce((sum, session) => sum + session.duration, 0)

    // Calculate streak (consecutive days with focus sessions)
    const streak = await calculateStreak(user.id, now)

    // Prepare activity chart data
    const activityData = await prepareActivityChartData(user.id, periodStart, now, period)

    // Combine and format recent activity
    const combinedActivity = [
      ...recentActivity[0].map(note => ({
        id: note.id,
        type: 'note' as const,
        title: note.title,
        timestamp: note.updatedAt,
      })),
      ...recentActivity[1].map(task => ({
        id: task.id,
        type: 'task' as const,
        title: task.title,
        timestamp: task.updatedAt,
      })),
      ...recentActivity[2].map(deck => ({
        id: deck.id,
        type: 'deck' as const,
        title: deck.name,
        timestamp: deck.updatedAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

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
      recentActivity: combinedActivity,
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

    // Count ANY activity on this day
    const [focusSessions, reviews, completedTasks, updatedNotes] = await Promise.all([
      prisma.focusSession.count({
        where: {
          userId,
          completedAt: {
            gte: checkDate,
            lt: dayEnd,
          },
        },
      }),
      prisma.review.count({
        where: {
          Flashcard: {
            Deck: {
              userId,
            },
          },
          createdAt: {
            gte: checkDate,
            lt: dayEnd,
          },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          completed: true,
          updatedAt: {
            gte: checkDate,
            lt: dayEnd,
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

    const activityOnDay = focusSessions + reviews + completedTasks + updatedNotes
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
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const [focusSessions, tasks, reviews] = await Promise.all([
        prisma.focusSession.findMany({
          where: {
            userId,
            completedAt: { gte: dayStart, lt: dayEnd },
          },
        }),
        prisma.task.count({
          where: {
            userId,
            completed: true,
            updatedAt: { gte: dayStart, lt: dayEnd },
          },
        }),
        prisma.review.count({
          where: {
            Flashcard: {
              Deck: {
                userId,
              },
            },
            createdAt: { gte: dayStart, lt: dayEnd },
          },
        }),
      ])

      const focusMinutes = focusSessions.reduce((sum, session) => sum + session.duration, 0)

      return {
        date: format(day, 'MMM dd'),
        fullDate: format(day, 'yyyy-MM-dd'),
        focusMinutes,
        tasksCompleted: tasks,
        cardsReviewed: reviews,
      }
    })
  )

  return dailyData
}
