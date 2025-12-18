"use client";

import { useState } from "react";
import { GripVertical, Trash2, Calendar, Edit2 } from "lucide-react";
import { format } from "date-fns";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  priority: number;
  order: number;
}

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
  dragHandleProps?: any;
}

const priorityColors = {
  0: "#d1d5db", // gray-300
  1: "#fbbf24", // yellow-400
  2: "#f87171", // red-400
};

const priorityLabels = {
  0: "Low",
  1: "Medium",
  2: "High",
};

const priorityBadgeColors = {
  0: "bg-gray-100 text-gray-700",
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-red-100 text-red-800",
};

export default function TaskItem({ task, onToggleComplete, onDelete, onEdit, dragHandleProps }: TaskItemProps) {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggleComplete(task.id, !task.completed);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div
      className={`rounded-lg shadow-sm p-4 mb-3 hover:shadow-md transition-shadow duration-300 ${task.completed ? "opacity-60" : ""}`}
      style={{
        backgroundColor: "var(--surface)",
        borderLeft: `4px solid ${priorityColors[task.priority as keyof typeof priorityColors]}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing pt-1">
          <GripVertical size={20} style={{ color: "var(--text-muted)" }} />
        </div>

        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          disabled={loading}
          className="mt-1 w-4 h-4 rounded focus:ring-2 cursor-pointer"
          style={{ accentColor: "var(--primary)" }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${task.completed ? "line-through" : ""}`} style={{ color: "var(--text-primary)" }}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(task)}
                className="transition-colors duration-300 cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                title="Edit task"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={deleteLoading}
                className="transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => !deleteLoading && (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => !deleteLoading && (e.currentTarget.style.color = "var(--text-muted)")}
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityBadgeColors[task.priority as keyof typeof priorityBadgeColors]}`}>
              {priorityLabels[task.priority as keyof typeof priorityLabels]}
            </span>

            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs" style={{ color: isOverdue ? "#dc2626" : "var(--text-secondary)" }}>
                <Calendar size={12} />
                <span className={isOverdue ? "font-medium" : ""}>
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                  {isOverdue && " (Overdue)"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Task?"
        description="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}

