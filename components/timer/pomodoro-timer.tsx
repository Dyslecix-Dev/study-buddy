"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { useTimer } from "@/contexts/timer-context";
import TimerSettings from "./timer-settings";

type TimerMode = "work" | "shortBreak" | "longBreak";

export default function PomodoroTimer() {
  const {
    mode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    customDurations,
    startTimer,
    pauseTimer,
    resetTimer,
    setMode,
    setCustomDurations,
  } = useTimer();

  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
  };

  const handleSettingsSave = (durations: typeof customDurations) => {
    setCustomDurations(durations);
    setShowSettings(false);
  };

  const progress = ((customDurations[mode] - timeLeft) / customDurations[mode]) * 100;

  const getModeColor = (currentMode: TimerMode) => {
    switch (currentMode) {
      case "work":
        return "#ef4444"; // red-500
      case "shortBreak":
        return "#22c55e"; // green-500
      case "longBreak":
        return "#3b82f6"; // blue-500
    }
  };

  const getModeLabel = (currentMode: TimerMode) => {
    switch (currentMode) {
      case "work":
        return "Focus Time";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: "var(--surface)" }}>
        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleModeChange("work")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer ${
              mode === "work" ? "text-white" : ""
            }`}
            style={{
              backgroundColor: mode === "work" ? getModeColor("work") : "var(--surface-secondary)",
              color: mode === "work" ? "white" : "var(--text-secondary)",
            }}
          >
            Focus
          </button>
          <button
            onClick={() => handleModeChange("shortBreak")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer ${
              mode === "shortBreak" ? "text-white" : ""
            }`}
            style={{
              backgroundColor: mode === "shortBreak" ? getModeColor("shortBreak") : "var(--surface-secondary)",
              color: mode === "shortBreak" ? "white" : "var(--text-secondary)",
            }}
          >
            Short Break
          </button>
          <button
            onClick={() => handleModeChange("longBreak")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer ${
              mode === "longBreak" ? "text-white" : ""
            }`}
            style={{
              backgroundColor: mode === "longBreak" ? getModeColor("longBreak") : "var(--surface-secondary)",
              color: mode === "longBreak" ? "white" : "var(--text-secondary)",
            }}
          >
            Long Break
          </button>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-7xl font-bold mb-2" style={{ color: getModeColor(mode) }}>
            {formatTime(timeLeft)}
          </div>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            {getModeLabel(mode)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full mb-6" style={{ backgroundColor: "var(--border)" }}>
          <div
            className="h-2 rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              backgroundColor: getModeColor(mode),
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={resetTimer}
            className="p-3 rounded-full transition-colors duration-300 cursor-pointer"
            style={{
              backgroundColor: "var(--surface-secondary)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-secondary)")}
            title="Reset timer"
          >
            <RotateCcw size={24} />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-6 rounded-full transition-all duration-300 cursor-pointer text-white"
            style={{
              backgroundColor: getModeColor(mode),
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {isRunning ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-full transition-colors duration-300 cursor-pointer"
            style={{
              backgroundColor: "var(--surface-secondary)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-secondary)")}
            title="Timer settings"
          >
            <SettingsIcon size={24} />
          </button>
        </div>

        {/* Session Counter */}
        <div className="text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Sessions completed today: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{sessionsCompleted}</span>
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <TimerSettings
          currentDurations={customDurations}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
