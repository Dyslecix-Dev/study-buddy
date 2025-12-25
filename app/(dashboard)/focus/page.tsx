"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTimer } from "@/contexts/timer-context";
import DashboardNav from "@/components/dashboard-nav";
import PomodoroTimer from "@/components/timer/pomodoro-timer";
import { Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface SessionLog {
  id: string;
  mode: string;
  duration: number;
  completedAt: Date;
}

export default function FocusPage() {
  const router = useRouter();
  const { setOnSessionComplete } = useTimer();
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [recentSessions, setRecentSessions] = useState<SessionLog[]>([]);

  const fetchTodayStats = async () => {
    try {
      const response = await fetch("/api/focus/today");
      if (response.ok) {
        const data = await response.json();
        setTodayMinutes(data.totalMinutes || 0);
        setSessionsToday(data.sessionCount || 0);
        setRecentSessions(data.recentSessions || []);
      }
    } catch (error) {
      console.error("Error fetching today's stats:", error);
    }
  };

  const handleSessionComplete = async (mode: string, duration: number) => {
    try {
      const response = await fetch("/api/focus/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, duration }),
      });

      if (response.ok) {
        toast.success(`${mode === "work" ? "Focus" : "Break"} session completed!`);
        fetchTodayStats();
      } else {
        toast.error("Failed to log session");
      }
    } catch (error) {
      console.error("Error logging session:", error);
      toast.error("Failed to log session");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      } else {
        fetchTodayStats();
      }
    };

    checkAuth();

    // Set the session complete callback
    setOnSessionComplete(handleSessionComplete);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Focus Timer
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Use the Pomodoro Technique to boost your productivity and maintain focus.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <PomodoroTimer />

            {/* Tips Section */}
            <div className="mt-6 rounded-lg p-6" style={{ backgroundColor: "var(--surface)" }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                How to use the Pomodoro Technique
              </h3>
              <ol className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <li>1. Choose a task to work on</li>
                <li>2. Set the timer and focus for 25 minutes</li>
                <li>3. Take a 5-minute break when the timer ends</li>
                <li>4. After 4 focus sessions, take a longer 15-minute break</li>
                <li>5. Repeat the process to stay productive</li>
              </ol>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: "var(--surface)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} style={{ color: "var(--primary)" }} />
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Today&apos;s Focus
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                    Total Focus Time
                  </p>
                  <p className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                    {todayMinutes} min
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                    Sessions Completed
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                    {sessionsToday}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: "var(--surface)" }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} style={{ color: "var(--secondary)" }} />
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Recent Sessions
                </h3>
              </div>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {session.mode === "work" ? "Focus" : session.mode === "shortBreak" ? "Short Break" : "Long Break"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(session.completedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                        {session.duration} min
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
                  No sessions yet today. Start your first focus session!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

