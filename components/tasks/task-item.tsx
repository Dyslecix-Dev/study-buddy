'use client'

import { useState } from 'react'
import { GripVertical, Trash2, Calendar, Edit2 } from 'lucide-react'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  dueDate: Date | null
  priority: number
}

interface TaskItemProps {
  task: Task
  onToggleComplete: (id: string, completed: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (task: Task) => void
  dragHandleProps?: any
}

const priorityColors = {
  0: 'border-gray-300',
  1: 'border-yellow-400',
  2: 'border-red-400',
}

const priorityLabels = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
}

const priorityBadgeColors = {
  0: 'bg-gray-100 text-gray-700',
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-red-100 text-red-800',
}

export default function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  dragHandleProps,
}: TaskItemProps) {
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await onToggleComplete(task.id, !task.completed)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    setDeleteLoading(true)
    try {
      await onDelete(task.id)
    } finally {
      setDeleteLoading(false)
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed

  return (
    <div
      className={`bg-white border-l-4 ${priorityColors[task.priority as keyof typeof priorityColors]} rounded-lg shadow-sm p-4 mb-3 hover:shadow-md transition-shadow ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing pt-1">
          <GripVertical size={20} className="text-gray-400" />
        </div>

        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          disabled={loading}
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={`text-sm font-medium text-gray-900 ${
                  task.completed ? 'line-through' : ''
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(task)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit task"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                priorityBadgeColors[task.priority as keyof typeof priorityBadgeColors]
              }`}
            >
              {priorityLabels[task.priority as keyof typeof priorityLabels]}
            </span>

            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Calendar size={12} />
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  {isOverdue && ' (Overdue)'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
