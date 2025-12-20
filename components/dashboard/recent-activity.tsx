"use client"

import { FileText, CheckSquare, Brain, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Activity {
  id: string
  type: 'note' | 'task' | 'deck' | 'session'
  title: string
  timestamp: Date | string
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText size={16} style={{ color: 'var(--primary)' }} />
      case 'task':
        return <CheckSquare size={16} style={{ color: 'var(--secondary)' }} />
      case 'deck':
        return <Brain size={16} style={{ color: 'var(--quaternary)' }} />
      case 'session':
        return <Clock size={16} style={{ color: 'var(--tertiary)' }} />
      default:
        return null
    }
  }

  const getLink = (activity: Activity) => {
    switch (activity.type) {
      case 'note':
        return `/notes`
      case 'task':
        return `/tasks`
      case 'deck':
        return `/flashcards`
      default:
        return '#'
    }
  }

  const getActionText = (type: string) => {
    switch (type) {
      case 'note':
        return 'Updated note'
      case 'task':
        return 'Completed task'
      case 'deck':
        return 'Updated deck'
      case 'session':
        return 'Finished session'
      default:
        return 'Activity'
    }
  }

  return (
    <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--surface)' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Recent Activity
      </h3>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Link
              key={`${activity.type}-${activity.id}`}
              href={getLink(activity)}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-opacity-50 transition-all"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            >
              <div className="mt-0.5">{getIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {activity.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {getActionText(activity.type)} •{' '}
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </Link>
          ))}
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
