"use client";

import { X, Calendar, Clock, Flag } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: number;
  completed: boolean;
  order: number;
}

interface EventDetailProps {
  task: Task | null;
  onClose: () => void;
  onToggleComplete: (id: string, completed: boolean) => void;
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

export default function EventDetail({ task, onClose, onToggleComplete }: EventDetailProps) {
  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex-1 pr-4">{task.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-300 cursor-pointer">
              <X size={24} />
            </button>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4 mb-6">
            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                    {format(new Date(task.dueDate), "MMMM d, yyyy")}
                    {isOverdue && " (Overdue)"}
                  </p>
                </div>
              </div>
            )}

            {/* Priority */}
            <div className="flex items-center gap-3">
              <Flag size={18} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                  {priorityLabels[task.priority as keyof typeof priorityLabels]}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-gray-900">{task.completed ? "Completed" : "In Progress"}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onToggleComplete(task.id, !task.completed)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors duration-300 cursor-pointer ${
                task.completed ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
            </button>
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-300 cursor-pointer">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

