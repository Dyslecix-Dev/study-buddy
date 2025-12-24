"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Plus, Calendar as CalendarIcon, List } from "lucide-react";
import TaskForm from "@/components/tasks/task-form";
import TaskList from "@/components/tasks/task-list";
import TaskFilters from "@/components/tasks/task-filters";
import CalendarView from "@/components/calendar/calendar-view";
import EventDetail from "@/components/calendar/event-detail";
import { TaskFormData } from "@/lib/validations/task";
import { toast } from "sonner";
import { Tag } from "@/lib/tag-utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
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
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "split">("split");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

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
        setTagRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

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
        setSelectedSlot(null);
        await fetchTasks();
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
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
        setSelectedTask(null);
      } else {
        toast.error("Failed to update task");
      }
    } catch (error) {
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
        await fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to reorder tasks");
      await fetchTasks();
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setSelectedSlot(null);
  };

  const handleSelectEvent = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setEditingTask(null);
    setShowForm(true);
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

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Tasks & Calendar
          </h1>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--surface)" }}>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${viewMode === "list" ? "" : "opacity-60"}`}
                style={{
                  backgroundColor: viewMode === "list" ? "var(--primary)" : "transparent",
                  color: viewMode === "list" ? "black" : "var(--text-secondary)",
                }}
              >
                <List size={16} />
                List
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${viewMode === "split" ? "" : "opacity-60"}`}
                style={{
                  backgroundColor: viewMode === "split" ? "var(--primary)" : "transparent",
                  color: viewMode === "split" ? "black" : "var(--text-secondary)",
                }}
              >
                <List size={16} />
                <CalendarIcon size={16} />
                Split
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${viewMode === "calendar" ? "" : "opacity-60"}`}
                style={{
                  backgroundColor: viewMode === "calendar" ? "var(--primary)" : "transparent",
                  color: viewMode === "calendar" ? "black" : "var(--text-secondary)",
                }}
              >
                <CalendarIcon size={16} />
                Calendar
              </button>
            </div>

            <button
              onClick={() => {
                setEditingTask(null);
                setSelectedSlot(null);
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
                    startTime: editingTask.startTime ? new Date(editingTask.startTime).toISOString().slice(0, 16) : "",
                    endTime: editingTask.endTime ? new Date(editingTask.endTime).toISOString().slice(0, 16) : "",
                    priority: editingTask.priority,
                    Tag: editingTask.Tag,
                  }
                : selectedSlot
                ? {
                    title: "",
                    description: "",
                    startTime: selectedSlot.start.toISOString().slice(0, 16),
                    endTime: selectedSlot.end.toISOString().slice(0, 16),
                    priority: 0,
                  }
                : undefined
            }
            isEdit={!!editingTask}
          />
        )}

        {viewMode === "list" && (
          <>
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
          </>
        )}

        {viewMode === "calendar" && (
          <div>
            <div className="rounded-lg shadow p-4 mb-6" style={{ backgroundColor: "var(--surface)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Priority Colors
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    High Priority
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Medium Priority
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Low Priority
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-400 opacity-50"></div>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Completed
                  </span>
                </div>
              </div>
            </div>
            <CalendarView tasks={filteredTasks} onSelectEvent={handleSelectEvent} onSelectSlot={handleSelectSlot} />
          </div>
        )}

        {viewMode === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Task List
              </h2>
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
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Calendar
              </h2>
              <div className="rounded-lg shadow p-4 mb-4" style={{ backgroundColor: "var(--surface)" }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Priority Colors
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      High
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Medium
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Low
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-400 opacity-50"></div>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Done
                    </span>
                  </div>
                </div>
              </div>
              <CalendarView tasks={filteredTasks} onSelectEvent={handleSelectEvent} onSelectSlot={handleSelectSlot} />
            </div>
          </div>
        )}
      </div>

      {selectedTask && <EventDetail task={selectedTask} onClose={handleCloseDetail} onToggleComplete={handleToggleComplete} onEdit={handleEdit} />}
    </div>
  );
}

