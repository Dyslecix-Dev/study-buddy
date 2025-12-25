"use client"

import {
  FileText,
  CheckSquare,
  Brain,
  Clock,
  Folder,
  Plus,
  Edit,
  Trash2,
  Coffee,
  Zap,
  BookOpen,
  HelpCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Activity {
  id: string
  type: string // Activity type from ActivityLog
  entityType: string
  entityId?: string
  title: string
  timestamp: Date | string
  metadata?: any
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string, entityType: string) => {
    // Focus sessions
    if (type.startsWith('focus_session')) {
      if (type === 'focus_session_work') {
        return <Zap size={16} style={{ color: 'var(--primary)' }} />
      }
      return <Coffee size={16} style={{ color: 'var(--tertiary)' }} />
    }

    // Entity-based icons
    switch (entityType) {
      case 'note':
        return <FileText size={16} style={{ color: 'var(--primary)' }} />
      case 'task':
        return <CheckSquare size={16} style={{ color: 'var(--secondary)' }} />
      case 'deck':
      case 'flashcard':
        return <Brain size={16} style={{ color: 'var(--quaternary)' }} />
      case 'folder':
        return <Folder size={16} style={{ color: '#9a9a44' }} />
      case 'exam':
        return <BookOpen size={16} style={{ color: '#9C27B0' }} />
      case 'question':
        return <HelpCircle size={16} style={{ color: '#9C27B0' }} />
      default:
        return <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
    }
  }

  const getLink = (activity: Activity) => {
    // Don't link to deleted items
    if (activity.type.includes('deleted') || !activity.entityId) {
      return '#'
    }

    switch (activity.entityType) {
      case 'note':
        return `/notes`
      case 'task':
        return `/tasks`
      case 'deck':
      case 'flashcard':
        return `/flashcards`
      case 'folder':
        return `/notes`
      case 'focus_session':
        return `/focus`
      case 'exam':
      case 'question':
        return `/exams`
      default:
        return '#'
    }
  }

  const getActionText = (type: string, entityType: string) => {
    // Focus sessions
    if (type === 'focus_session_work') return 'Completed focus session'
    if (type === 'focus_session_short_break') return 'Took short break'
    if (type === 'focus_session_long_break') return 'Took long break'

    // Notes
    if (type === 'note_created') return 'Created note'
    if (type === 'note_updated') return 'Updated note'
    if (type === 'note_deleted') return 'Deleted note'

    // Tasks
    if (type === 'task_created') return 'Created task'
    if (type === 'task_completed') return 'Completed task'
    if (type === 'task_uncompleted') return 'Uncompleted task'
    if (type === 'task_deleted') return 'Deleted task'

    // Folders
    if (type === 'folder_created') return 'Created folder'
    if (type === 'folder_updated') return 'Updated folder'
    if (type === 'folder_deleted') return 'Deleted folder'

    // Decks
    if (type === 'deck_created') return 'Created deck'
    if (type === 'deck_updated') return 'Updated deck'
    if (type === 'deck_deleted') return 'Deleted deck'

    // Flashcards
    if (type === 'flashcard_created') return 'Created flashcard'
    if (type === 'flashcard_updated') return 'Updated flashcard'
    if (type === 'flashcard_deleted') return 'Deleted flashcard'
    if (type === 'flashcard_reviewed') return 'Reviewed flashcard'

    // Exams
    if (type === 'exam_created') return 'Created exam'
    if (type === 'exam_updated') return 'Updated exam'
    if (type === 'exam_deleted') return 'Deleted exam'
    if (type === 'exam_completed') return 'Completed exam'

    // Questions
    if (type === 'question_created') return 'Created question'
    if (type === 'question_updated') return 'Updated question'
    if (type === 'question_deleted') return 'Deleted question'

    return 'Activity'
  }

  const getActivityColor = (type: string) => {
    if (type.includes('deleted')) return 'var(--text-muted)'
    if (type.includes('completed') || type.includes('reviewed')) return 'var(--secondary)'
    if (type.includes('created')) return 'var(--primary)'
    if (type.startsWith('focus_session_work')) return 'var(--primary)'
    return 'var(--text-primary)'
  }

  return (
    <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--surface)' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Recent Activity
      </h3>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const isClickable = !activity.type.includes('deleted') && activity.entityId
            const content = (
              <>
                <div className="mt-0.5">{getIcon(activity.type, activity.entityType)}</div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: getActivityColor(activity.type) }}
                  >
                    {activity.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {getActionText(activity.type, activity.entityType)} •{' '}
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </>
            )

            if (isClickable) {
              return (
                <Link
                  key={`${activity.id}-${index}`}
                  href={getLink(activity)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-opacity-50 transition-all"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  {content}
                </Link>
              )
            }

            return (
              <div
                key={`${activity.id}-${index}`}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ backgroundColor: 'var(--surface-secondary)', opacity: 0.7 }}
              >
                {content}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No recent activity yet. Start creating notes, tasks, or flashcards!
          </p>
        </div>
      )}
    </div>
  )
}
