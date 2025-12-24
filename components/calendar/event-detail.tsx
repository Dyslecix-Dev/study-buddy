"use client";

import { X, Calendar, Clock, Flag, Hash, Edit } from "lucide-react";
import { format } from "date-fns";
import { Tag } from "@/lib/tag-utils";
import TagBadge from "@/components/tags/tag-badge";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  priority: number;
  completed: boolean;
  order: number;
  Tag?: Tag[];
}

interface EventDetailProps {
  task: Task | null;
  onClose: () => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit?: (task: Task) => void;
}

const priorityLabels = {
  0: "Low",
  1: "Medium",
  2: "High",
};

const priorityColors = {
  0: "text-gray-700 bg-gray-100",
  1: "text-yellow-700 bg-yellow-100",
  2: "text-red-700 bg-red-100",
};

export default function EventDetail({ task, onClose, onToggleComplete, onEdit }: EventDetailProps) {
  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const hasTimeRange = task.startTime && task.endTime;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold flex-1 pr-4" style={{ color: 'var(--text-primary)' }}>{task.title}</h2>
            <button onClick={onClose} className="transition-colors duration-300 cursor-pointer" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <X size={24} />
            </button>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4 mb-6">
            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-3">
                <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Due Date</p>
                  <p className="font-medium" style={{ color: isOverdue ? "#ef4444" : 'var(--text-primary)' }}>
                    {format(new Date(task.dueDate), "MMMM d, yyyy")}
                    {isOverdue && " (Overdue)"}
                  </p>
                </div>
              </div>
            )}

            {/* Time Range */}
            {hasTimeRange && (
              <div className="flex items-center gap-3">
                <Clock size={18} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Time</p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {format(new Date(task.startTime!), "MMM d, yyyy h:mm a")} - {format(new Date(task.endTime!), "h:mm a")}
                  </p>
                </div>
              </div>
            )}

            {/* Priority */}
            <div className="flex items-center gap-3">
              <Flag size={18} style={{ color: 'var(--text-secondary)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Priority</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                  {priorityLabels[task.priority as keyof typeof priorityLabels]}
                </span>
              </div>
            </div>

            {/* Tags */}
            {task.Tag && task.Tag.length > 0 && (
              <div className="flex items-start gap-3">
                <Hash size={18} style={{ color: 'var(--text-secondary)' }} className="mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {task.Tag.map((tag) => (
                      <TagBadge key={tag.id} tag={tag} size="sm" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-3">
              <Flag size={18} style={{ color: 'var(--text-secondary)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Status</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{task.completed ? "Completed" : "In Progress"}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(task);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-300 cursor-pointer"
                style={{ backgroundColor: 'var(--primary)', color: 'black' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Edit size={16} />
                Edit
              </button>
            )}
            <button
              onClick={() => onToggleComplete(task.id, !task.completed)}
              className="flex-1 px-4 py-2 rounded-md font-medium transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: task.completed ? 'var(--surface-hover)' : '#10b981',
                color: task.completed ? 'var(--text-primary)' : 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {task.completed ? "Mark Incomplete" : "Mark Complete"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md font-medium transition-all duration-300 cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--surface)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

