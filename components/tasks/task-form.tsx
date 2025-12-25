"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormData } from "@/lib/validations/task";
import { X } from "lucide-react";
import { Tag } from "@/lib/tag-utils";
import TagInput from "@/components/tags/tag-input";
import Button from "@/components/ui/button";

interface TaskFormProps {
  onSubmit: (data: TaskFormData & { tagIds?: string[] }) => Promise<void>;
  onCancel: () => void;
  initialData?: TaskFormData & { Tag?: Tag[] };
  isEdit?: boolean;
}

export default function TaskForm({ onSubmit, onCancel, initialData, isEdit = false }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialData?.Tag || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      priority: 0,
    },
  });

  const onSubmitForm = async (data: TaskFormData) => {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        tagIds: selectedTags.map((tag) => tag.id),
      });
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
            <label htmlFor="startTime" className="block text-sm font-medium mb-1 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              Start Time
            </label>
            <input
              {...register("startTime")}
              id="startTime"
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
            />
            {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>}
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium mb-1 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              End Time (Due)
            </label>
            <input
              {...register("endTime")}
              id="endTime"
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
            />
            {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-1 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
            Priority
          </label>
          <select
            {...register("priority", { valueAsNumber: true })}
            id="priority"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
          {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            Tags
          </label>
          <TagInput selectedTags={selectedTags} onTagsChange={setSelectedTags} placeholder="Add tags to organize..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" onClick={onCancel} disabled={loading} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} variant="primary">
            {isEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </div>
    </form>
  );
}

