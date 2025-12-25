import { prisma } from './prisma'
import { startOfDay } from 'date-fns'

export type ProgressType = 'taskCompleted' | 'cardReviewed' | 'noteCreated' | 'noteUpdated' | 'focusSession' | 'examCompleted' | 'questionCreated'

/**
 * Increments the daily progress counter for a specific activity type
 * This ensures progress is preserved even when items are deleted
 * For focus sessions, pass the duration in minutes as the amount parameter
 */
export async function incrementDailyProgress(
  userId: string,
  type: ProgressType,
  date: Date = new Date(),
  amount: number = 1
) {
  const dayStart = startOfDay(date)

  try {
    // Use upsert to either create new record or increment existing one
    const updateData: any = { updatedAt: new Date() }

    switch (type) {
      case 'taskCompleted':
        updateData.tasksCompleted = { increment: amount }
        break
      case 'cardReviewed':
        updateData.cardsReviewed = { increment: amount }
        break
      case 'noteCreated':
        updateData.notesCreated = { increment: amount }
        break
      case 'noteUpdated':
        updateData.notesUpdated = { increment: amount }
        break
      case 'focusSession':
        updateData.focusMinutes = { increment: amount }
        break
      case 'examCompleted':
        updateData.examsCompleted = { increment: amount }
        break
      case 'questionCreated':
        updateData.questionsCreated = { increment: amount }
        break
    }

    await prisma.dailyProgress.upsert({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
      update: updateData,
      create: {
        userId,
        date: dayStart,
        tasksCompleted: type === 'taskCompleted' ? amount : 0,
        cardsReviewed: type === 'cardReviewed' ? amount : 0,
        notesCreated: type === 'noteCreated' ? amount : 0,
        notesUpdated: type === 'noteUpdated' ? amount : 0,
        focusMinutes: type === 'focusSession' ? amount : 0,
        examsCompleted: type === 'examCompleted' ? amount : 0,
        questionsCreated: type === 'questionCreated' ? amount : 0,
      },
    })
  } catch (error) {
    console.error('Error incrementing daily progress:', error)
    // Don't throw - we don't want progress tracking to break the main operation
  }
}

/**
 * Decrements the daily progress counter (used for undo operations)
 * Note: This should only be used when uncompleting tasks, not for deletions
 */
export async function decrementDailyProgress(
  userId: string,
  type: ProgressType,
  date: Date = new Date(),
  amount: number = 1
) {
  const dayStart = startOfDay(date)

  try {
    const existing = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
    })

    if (!existing) return

    const updateData: any = { updatedAt: new Date() }

    switch (type) {
      case 'taskCompleted':
        // Don't go below 0
        if (existing.tasksCompleted > 0) {
          updateData.tasksCompleted = { decrement: Math.min(amount, existing.tasksCompleted) }
        }
        break
      case 'cardReviewed':
        if (existing.cardsReviewed > 0) {
          updateData.cardsReviewed = { decrement: Math.min(amount, existing.cardsReviewed) }
        }
        break
      case 'noteCreated':
        if (existing.notesCreated > 0) {
          updateData.notesCreated = { decrement: Math.min(amount, existing.notesCreated) }
        }
        break
      case 'noteUpdated':
        if (existing.notesUpdated > 0) {
          updateData.notesUpdated = { decrement: Math.min(amount, existing.notesUpdated) }
        }
        break
      case 'focusSession':
        if (existing.focusMinutes > 0) {
          updateData.focusMinutes = { decrement: Math.min(amount, existing.focusMinutes) }
        }
        break
      case 'examCompleted':
        if (existing.examsCompleted > 0) {
          updateData.examsCompleted = { decrement: Math.min(amount, existing.examsCompleted) }
        }
        break
      case 'questionCreated':
        if (existing.questionsCreated > 0) {
          updateData.questionsCreated = { decrement: Math.min(amount, existing.questionsCreated) }
        }
        break
    }

    await prisma.dailyProgress.update({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
      data: updateData,
    })
  } catch (error) {
    console.error('Error decrementing daily progress:', error)
  }
}
