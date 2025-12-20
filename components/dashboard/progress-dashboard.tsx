"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "./stats-card";
import { ActivityChart } from "./activity-chart";
import { StreakCalendar } from "./streak-calendar";
import { RecentActivity } from "./recent-activity";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { Clock, CheckSquare, Brain, FileText, Flame, TrendingUp } from "lucide-react";

interface DashboardStats {
  period: string;
  overview: {
    totalNotes: number;
    totalTasks: number;
    completedTasks: number;
    totalFlashcards: number;
    totalDecks: number;
    reviewsCount: number;
    totalFocusMinutes: number;
    totalStudyMinutes: number;
    streak: number;
  };
  activityData: Array<{
    date: string;
    fullDate: string;
    focusMinutes: number;
    tasksCompleted: number;
    cardsReviewed: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: "note" | "task" | "deck";
    title: string;
    timestamp: string;
  }>;
}

export function ProgressDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [chartMetric, setChartMetric] = useState<"focus" | "tasks" | "cards" | "all">("all");
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/stats?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "var(--text-secondary)" }}>Failed to load dashboard statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ minHeight: loading ? "600px" : "auto" }}>
      {loading && <DashboardSkeleton />}
      {!loading && stats && (
        <>
          {/* Period Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Progress Dashboard
            </h2>
            <div className="flex gap-2">
              {(["day", "week", "month"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                  style={{
                    backgroundColor: period === p ? "var(--primary)" : "var(--surface)",
                    color: period === p ? "#1a1a1a" : "var(--text-primary)",
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Focus Time"
              value={`${stats.overview.totalFocusMinutes} min`}
              subtitle={`${period === "day" ? "Today" : `This ${period}`}`}
              icon={Clock}
              iconColor="var(--primary)"
              iconBgColor="#7ADAA533"
            />
            <StatsCard
              title="Tasks Completed"
              value={stats.overview.completedTasks}
              subtitle={`${stats.overview.totalTasks} total ${stats.overview.totalTasks > 1 ? "tasks" : "task"}`}
              icon={CheckSquare}
              iconColor="var(--secondary)"
              iconBgColor="#239BA733"
            />
            <StatsCard
              title="Cards Reviewed"
              value={stats.overview.reviewsCount}
              subtitle={`${stats.overview.totalFlashcards} total ${stats.overview.totalFlashcards > 1 ? "cards" : "card"}`}
              icon={Brain}
              iconColor="var(--quaternary)"
              iconBgColor="#E1AA3633"
            />
            <StatsCard
              title="Study Streak"
              value={`${stats.overview.streak} ${stats.overview.streak > 1 ? "days" : "day"}`}
              subtitle={stats.overview.streak > 0 ? "Keep it going! 🔥" : "Start today!"}
              icon={Flame}
              iconColor="#ff6b6b"
              iconBgColor="#ff6b6b33"
            />
          </div>

          {/* Activity Chart Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-lg shadow-sm p-4 sm:p-6" style={{ backgroundColor: "var(--surface)" }}>
                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    Activity Trends
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {(["all", "focus", "tasks", "cards"] as const).map((metric) => (
                      <button
                        key={metric}
                        onClick={() => setChartMetric(metric)}
                        className="px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer"
                        style={{
                          backgroundColor: chartMetric === metric ? "var(--surface-secondary)" : "transparent",
                          color: chartMetric === metric ? "var(--text-primary)" : "var(--text-secondary)",
                        }}
                      >
                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <ActivityChart data={stats.activityData} metric={chartMetric} />
              </div>
            </div>

            {/* Stats Summary */}
            <div className="space-y-6">
              <div className="rounded-lg shadow-sm p-4 sm:p-6" style={{ backgroundColor: "var(--surface)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={20} style={{ color: "var(--primary)" }} />
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    Quick Stats
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2">
                      <FileText size={16} style={{ color: "var(--primary)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Total Notes
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {stats.overview.totalNotes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2">
                      <Brain size={16} style={{ color: "var(--quaternary)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Flashcard Decks
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {stats.overview.totalDecks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare size={16} style={{ color: "var(--secondary)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Total Tasks
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {stats.overview.totalTasks}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Calendar and Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            <StreakCalendar currentStreak={stats.overview.streak} />
            <RecentActivity activities={stats.recentActivity} />
          </div>
        </>
      )}
    </div>
  );
}

