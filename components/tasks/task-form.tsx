"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormData } from "@/lib/validations/task";
import { X } from "lucide-react";

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: TaskFormData;
  isEdit?: boolean;
}

export default function TaskForm({ onSubmit, onCancel, initialData, isEdit = false }: TaskFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      dueDate: "",
      priority: 0,
    },
  });

  const onSubmitForm = async (data: TaskFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="rounded-lg shadow p-6 mb-6" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-secondary)" }}>
          {isEdit ? "Edit Task" : "New Task"}
        </h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors duration-300 cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Title *
          </label>
          <input
            {...register("title")}
            id="title"
            type="text"
            placeholder="Task title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ color: "var(--text-secondary)" }}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Description
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={3}
            placeholder="Task description (optional)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            style={{ color: "var(--text-secondary)" }}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              Due Date
            </label>
            <input
              {...register("dueDate")}
              id="dueDate"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: "var(--text-secondary)" }}
            />
            {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              Priority
            </label>
            <select
              {...register("priority", { valueAsNumber: true })}
              id="priority"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: "var(--text-secondary)" }}
            >
              <option value={0}>Low</option>
              <option value={1}>Medium</option>
              <option value={2}>High</option>
            </select>
            {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 disabled:opacity-50 cursor-pointer"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              backgroundColor: "var(--surface)",
              borderWidth: "1px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface)")}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </form>
  );
}

