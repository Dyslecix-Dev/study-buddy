"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Plus } from "lucide-react";
import TaskForm from "@/components/tasks/task-form";
import TaskList from "@/components/tasks/task-list";
import TaskFilters from "@/components/tasks/task-filters";
import { TaskFormData } from "@/lib/validations/task";
import { toast } from "sonner";
import { Tag } from "@/lib/tag-utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  priority: number;
  order: number;
  Tag?: Tag[];
}

export default function TasksPage() {
  const router = useRouter();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [tagRefreshKey, setTagRefreshKey] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const checkAuth = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    }
  };

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);

      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAllTasks(data);
        setTagRefreshKey(prev => prev + 1); // Force TagFilter to refresh
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Client-side tag filtering
  const filteredTasks = useMemo(() => {
    if (tagFilter.length === 0) return allTasks;

    return allTasks.filter((task) => {
      if (!task.Tag || task.Tag.length === 0) return false;
      return tagFilter.some((tagId) => task.Tag!.some((tag) => tag.id === tagId));
    });
  }, [allTasks, tagFilter]);

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Task created successfully");
        setShowForm(false);
        await fetchTasks();
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return;

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Task updated successfully");
        setEditingTask(null);
        await fetchTasks();
      } else {
        toast.error("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        toast.success(completed ? "Task marked as complete" : "Task marked as incomplete");
        await fetchTasks();
      } else {
        toast.error("Failed to update task");
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Task deleted successfully");
        await fetchTasks();
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleReorder = async (reorderedTasks: Task[]) => {
    setAllTasks(reorderedTasks);

    try {
      const response = await fetch("/api/tasks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: reorderedTasks.map((task) => ({ id: task.id, order: task.order })),
        }),
      });

      if (!response.ok) {
        toast.error("Failed to reorder tasks");
        await fetchTasks(); // Revert on error
      }
    } catch (error) {
      console.error("Error reordering tasks:", error);
      toast.error("Failed to reorder tasks");
      await fetchTasks(); // Revert on error
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <DashboardNav />
        <LoadingSpinner message="Loading tasks..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            My Tasks
          </h1>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-black rounded-md transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: "var(--primary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={18} />
            New Task
          </button>
        </div>

        {(showForm || editingTask) && (
          <TaskForm
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleCancelForm}
            initialData={
              editingTask
                ? {
                    title: editingTask.title,
                    description: editingTask.description || "",
                    dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split("T")[0] : "",
                    priority: editingTask.priority,
                    Tag: editingTask.Tag,
                  }
                : undefined
            }
            isEdit={!!editingTask}
          />
        )}

        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          tagFilter={tagFilter}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onTagFilterChange={setTagFilter}
          refreshKey={tagRefreshKey}
        />

        <TaskList tasks={filteredTasks} onReorder={handleReorder} onToggleComplete={handleToggleComplete} onDelete={handleDeleteTask} onEdit={handleEdit} />
      </div>
    </div>
  );
}
