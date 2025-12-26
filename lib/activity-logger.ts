import { prisma } from './prisma'

export type ActivityType =
  | 'note_created'
  | 'note_updated'
  | 'note_deleted'
  | 'task_created'
  | 'task_completed'
  | 'task_uncompleted'
  | 'task_deleted'
  | 'folder_created'
  | 'folder_updated'
  | 'folder_deleted'
  | 'folder_shared'
  | 'folder_received'
  | 'deck_created'
  | 'deck_updated'
  | 'deck_deleted'
  | 'deck_shared'
  | 'deck_received'
  | 'flashcard_created'
  | 'flashcard_updated'
  | 'flashcard_deleted'
  | 'flashcard_reviewed'
  | 'focus_session_work'
  | 'focus_session_short_break'
  | 'focus_session_long_break'
  | 'exam_created'
  | 'exam_updated'
  | 'exam_deleted'
  | 'exam_completed'
  | 'exam_shared'
  | 'exam_received'
  | 'question_created'
  | 'question_updated'
  | 'question_deleted'

export type EntityType = 'note' | 'task' | 'folder' | 'deck' | 'flashcard' | 'focus_session' | 'exam' | 'question'

interface LogActivityParams {
  userId: string
  type: ActivityType
  entityType: EntityType
  entityId?: string
  title: string
  metadata?: Record<string, any>
}

/**
 * Logs user activity to the ActivityLog table for permanent tracking
 * This allows us to show recent activity even after items are deleted
 */
export async function logActivity(params: LogActivityParams) {
  const { userId, type, entityType, entityId, title, metadata } = params

  try {
    await prisma.activityLog.create({
      data: {
        userId,
        type,
        entityType,
        entityId: entityId || null,
        title,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw - we don't want activity logging to break the main operation
  }
}

/**
 * Helper functions for common activity types
 */

export async function logNoteCreated(userId: string, noteId: string, title: string) {
  return logActivity({
    userId,
    type: 'note_created',
    entityType: 'note',
    entityId: noteId,
    title,
  })
}

export async function logNoteUpdated(userId: string, noteId: string, title: string) {
  return logActivity({
    userId,
    type: 'note_updated',
    entityType: 'note',
    entityId: noteId,
    title,
  })
}

export async function logNoteDeleted(userId: string, title: string) {
  return logActivity({
    userId,
    type: 'note_deleted',
    entityType: 'note',
    title,
  })
}

export async function logTaskCreated(userId: string, taskId: string, title: string) {
  return logActivity({
    userId,
    type: 'task_created',
    entityType: 'task',
    entityId: taskId,
    title,
  })
}

export async function logTaskCompleted(userId: string, taskId: string, title: string) {
  return logActivity({
    userId,
    type: 'task_completed',
    entityType: 'task',
    entityId: taskId,
    title,
  })
}

export async function logTaskUncompleted(userId: string, taskId: string, title: string) {
  return logActivity({
    userId,
    type: 'task_uncompleted',
    entityType: 'task',
    entityId: taskId,
    title,
  })
}

export async function logTaskDeleted(userId: string, title: string) {
  return logActivity({
    userId,
    type: 'task_deleted',
    entityType: 'task',
    title,
  })
}

export async function logFolderCreated(userId: string, folderId: string, name: string) {
  return logActivity({
    userId,
    type: 'folder_created',
    entityType: 'folder',
    entityId: folderId,
    title: name,
  })
}

export async function logFolderUpdated(userId: string, folderId: string, name: string) {
  return logActivity({
    userId,
    type: 'folder_updated',
    entityType: 'folder',
    entityId: folderId,
    title: name,
  })
}

export async function logFolderDeleted(userId: string, name: string) {
  return logActivity({
    userId,
    type: 'folder_deleted',
    entityType: 'folder',
    title: name,
  })
}

export async function logDeckCreated(userId: string, deckId: string, name: string) {
  return logActivity({
    userId,
    type: 'deck_created',
    entityType: 'deck',
    entityId: deckId,
    title: name,
  })
}

export async function logDeckUpdated(userId: string, deckId: string, name: string) {
  return logActivity({
    userId,
    type: 'deck_updated',
    entityType: 'deck',
    entityId: deckId,
    title: name,
  })
}

export async function logDeckDeleted(userId: string, name: string) {
  return logActivity({
    userId,
    type: 'deck_deleted',
    entityType: 'deck',
    title: name,
  })
}

export async function logFlashcardCreated(userId: string, flashcardId: string, deckName: string) {
  return logActivity({
    userId,
    type: 'flashcard_created',
    entityType: 'flashcard',
    entityId: flashcardId,
    title: `Card in ${deckName}`,
  })
}

export async function logFlashcardReviewed(userId: string, flashcardId: string, deckName: string) {
  return logActivity({
    userId,
    type: 'flashcard_reviewed',
    entityType: 'flashcard',
    entityId: flashcardId,
    title: `Reviewed card in ${deckName}`,
  })
}

export async function logFocusSession(
  userId: string,
  sessionId: string,
  mode: 'work' | 'shortBreak' | 'longBreak',
  duration: number
) {
  const typeMap = {
    work: 'focus_session_work' as const,
    shortBreak: 'focus_session_short_break' as const,
    longBreak: 'focus_session_long_break' as const,
  }

  const titleMap = {
    work: `Focus session (${duration} min)`,
    shortBreak: `Short break (${duration} min)`,
    longBreak: `Long break (${duration} min)`,
  }

  return logActivity({
    userId,
    type: typeMap[mode],
    entityType: 'focus_session',
    entityId: sessionId,
    title: titleMap[mode],
    metadata: { duration, mode },
  })
}

export async function logExamCreated(userId: string, examId: string, name: string) {
  return logActivity({
    userId,
    type: 'exam_created',
    entityType: 'exam',
    entityId: examId,
    title: name,
  })
}

export async function logExamUpdated(userId: string, examId: string, name: string) {
  return logActivity({
    userId,
    type: 'exam_updated',
    entityType: 'exam',
    entityId: examId,
    title: name,
  })
}

export async function logExamDeleted(userId: string, name: string) {
  return logActivity({
    userId,
    type: 'exam_deleted',
    entityType: 'exam',
    title: name,
  })
}

export async function logExamCompleted(userId: string, examId: string, examName: string, score: number) {
  return logActivity({
    userId,
    type: 'exam_completed',
    entityType: 'exam',
    entityId: examId,
    title: `Completed: ${examName}`,
    metadata: { score },
  })
}

export async function logQuestionCreated(userId: string, questionId: string, examName: string) {
  return logActivity({
    userId,
    type: 'question_created',
    entityType: 'question',
    entityId: questionId,
    title: `Question in ${examName}`,
  })
}

export async function logQuestionUpdated(userId: string, questionId: string, examName: string) {
  return logActivity({
    userId,
    type: 'question_updated',
    entityType: 'question',
    entityId: questionId,
    title: `Question in ${examName}`,
  })
}

export async function logQuestionDeleted(userId: string, examName: string) {
  return logActivity({
    userId,
    type: 'question_deleted',
    entityType: 'question',
    title: `Question in ${examName}`,
  })
}
