/**
 * Backfill script to populate DailyProgress table with historical data
 * This preserves existing progress stats from tasks and reviews
 *
 * Run with: npx tsx scripts/backfill-daily-progress.ts
 */

import { prisma } from '../lib/prisma'
import { startOfDay, eachDayOfInterval, subMonths } from 'date-fns'

async function backfillDailyProgress() {
  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  })

  for (const user of users) {

    // Find the earliest activity date for this user
    const [earliestTask, earliestReview] = await Promise.all([
      prisma.task.findFirst({
        where: { userId: user.id, completed: true },
        orderBy: { updatedAt: 'asc' },
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
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
    ])

    const dates = [
      earliestTask?.updatedAt,
      earliestReview?.createdAt,
    ].filter(Boolean) as Date[]

    if (dates.length === 0) {
      continue
    }

    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const today = new Date()

    // Generate all days from earliest activity to today
    const days = eachDayOfInterval({ start: earliestDate, end: today })

    for (const day of days) {
      const dayStart = startOfDay(day)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

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
      })

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
      })

      // Only create record if there was activity
      if (tasksCompleted > 0 || cardsReviewed > 0) {
        const existing = await prisma.dailyProgress.findUnique({
          where: {
            userId_date: {
              userId: user.id,
              date: dayStart,
            },
          },
        })

        if (existing) {
          // Update existing record
          await prisma.dailyProgress.update({
            where: {
              userId_date: {
                userId: user.id,
                date: dayStart,
              },
            },
            data: {
              tasksCompleted,
              cardsReviewed,
            },
          })
        } else {
          // Create new record
          await prisma.dailyProgress.create({
            data: {
              userId: user.id,
              date: dayStart,
              tasksCompleted,
              cardsReviewed,
              notesCreated: 0,
              notesUpdated: 0,
            },
          })
        }
      }
    }
  }
}

backfillDailyProgress()
  .catch((error) => {
    console.error('Error during backfill:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
