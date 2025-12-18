"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import CalendarView from "@/components/calendar/calendar-view";
import EventDetail from "@/components/calendar/event-detail";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  priority: number;
  order: number;
}

export default function CalendarPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

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
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
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
      console.error("Error toggling task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleSelectEvent = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Task Calendar
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>View all your tasks with due dates. Click on an event to see details.</p>
        </div>

        {/* Legend */}
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
              <div className="w-4 h-4 rounded bg-gray-500"></div>
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

        {/* Calendar */}
        {tasks.length === 0 ? (
          <div className="rounded-lg shadow p-12 text-center" style={{ backgroundColor: "var(--surface)" }}>
            <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
              No tasks with due dates found.
            </p>
            <Link
              href="/tasks"
              className="font-medium transition-all duration-300"
              style={{ color: "var(--primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Create a task with a due date
            </Link>
          </div>
        ) : (
          <CalendarView tasks={tasks} onSelectEvent={handleSelectEvent} />
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedTask && <EventDetail task={selectedTask} onClose={handleCloseDetail} onToggleComplete={handleToggleComplete} />}
    </div>
  );
}

