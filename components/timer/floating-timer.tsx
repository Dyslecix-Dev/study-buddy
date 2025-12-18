"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Timer, Play, Pause, X, Maximize2 } from "lucide-react";
import { useTimer } from "@/contexts/timer-context";

export default function FloatingTimer() {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, timeLeft, isRunning, startTimer, pauseTimer } = useTimer();
  const [isMinimized, setIsMinimized] = useState(false);

  // Don't show on focus page or login/signup pages
  if (pathname?.startsWith("/focus") || pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname === "/") {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getModeColor = () => {
    switch (mode) {
      case "work":
        return "#ef4444"; // red-500
      case "shortBreak":
        return "#22c55e"; // green-500
      case "longBreak":
        return "#3b82f6"; // blue-500
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "work":
        return "Focus";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg transition-all duration-300 cursor-pointer z-40"
        style={{
          backgroundColor: getModeColor(),
          color: "white",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        title="Show timer"
      >
        <Timer size={24} />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 rounded-lg shadow-xl p-4 z-40"
      style={{
        backgroundColor: "var(--surface)",
        borderLeft: `4px solid ${getModeColor()}`,
        minWidth: "240px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getModeColor(),
              animation: isRunning ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none",
            }}
          />
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {getModeLabel()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/focus")}
            className="p-1 rounded transition-colors duration-300 cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            title="Open focus page"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded transition-colors duration-300 cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            title="Minimize timer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-3">
        <div className="text-4xl font-bold mb-1" style={{ color: getModeColor() }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 cursor-pointer"
          style={{
            backgroundColor: getModeColor(),
            color: "white",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {isRunning ? (
            <>
              <Pause size={16} />
              Pause
            </>
          ) : (
            <>
              <Play size={16} />
              Start
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
