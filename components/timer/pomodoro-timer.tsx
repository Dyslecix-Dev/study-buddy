"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Settings as SettingsIcon, Music, SkipForward, SkipBack, Repeat } from "lucide-react";
import { useTimer } from "@/contexts/timer-context";
import TimerSettings from "./timer-settings";

type TimerMode = "work" | "shortBreak" | "longBreak";

export default function PomodoroTimer() {
  const {
    mode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    isMusicEnabled,
    musicGenre,
    isLooping,
    currentTrackName,
    audioProgress,
    audioDuration,
    customDurations,
    startTimer,
    pauseTimer,
    resetTimer,
    setMode,
    setCustomDurations,
    toggleMusic,
    setMusicGenre,
    nextTrack,
    previousTrack,
    toggleLoop,
    seekAudio,
  } = useTimer();

  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatAudioTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

        {/* Music Player Section */}
        <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
          {/* Genre Selection & Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setMusicGenre("jazz")}
                className="px-3 py-1 rounded text-xs font-medium transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: musicGenre === "jazz" ? "var(--primary)" : "var(--surface-secondary)",
                  color: musicGenre === "jazz" ? "#1a1a1a" : "var(--text-secondary)",
                }}
              >
                Jazz
              </button>
              <button
                onClick={() => setMusicGenre("edm")}
                className="px-3 py-1 rounded text-xs font-medium transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: musicGenre === "edm" ? "var(--primary)" : "var(--surface-secondary)",
                  color: musicGenre === "edm" ? "#1a1a1a" : "var(--text-secondary)",
                }}
              >
                EDM
              </button>
              <button
                onClick={() => setMusicGenre("hiphop")}
                className="px-3 py-1 rounded text-xs font-medium transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: musicGenre === "hiphop" ? "var(--primary)" : "var(--surface-secondary)",
                  color: musicGenre === "hiphop" ? "#1a1a1a" : "var(--text-secondary)",
                }}
              >
                Hip-Hop
              </button>
            </div>
            <button
              onClick={toggleMusic}
              className="flex items-center gap-2 px-3 py-1 rounded-md transition-colors duration-300 cursor-pointer text-xs"
              style={{
                backgroundColor: isMusicEnabled ? "var(--primary)" : "var(--surface-secondary)",
                color: isMusicEnabled ? "#1a1a1a" : "var(--text-primary)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              title={isMusicEnabled ? "Music on" : "Music off"}
            >
              <Music size={14} style={{ opacity: isMusicEnabled ? 1 : 0.5 }} />
              {isMusicEnabled ? "On" : "Off"}
            </button>
          </div>

          {/* Current Track Display & Scrubber */}
          {isMusicEnabled && (
            <div className="mb-3">
              <p className="text-xs text-center mb-2" style={{ color: "var(--text-secondary)" }}>
                Now Playing
              </p>
              <p className="text-sm font-medium text-center truncate mb-3" style={{ color: "var(--text-primary)" }}>
                {currentTrackName}
              </p>

              {/* Audio Progress Bar */}
              <div className="mb-2">
                <input
                  type="range"
                  min="0"
                  max={audioDuration || 100}
                  value={audioProgress}
                  onChange={(e) => seekAudio(Number(e.target.value))}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(audioProgress / (audioDuration || 1)) * 100}%, var(--border) ${(audioProgress / (audioDuration || 1)) * 100}%, var(--border) 100%)`,
                  }}
                />
              </div>

              {/* Time Display */}
              <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                <span>{formatAudioTime(audioProgress)}</span>
                <span>{formatAudioTime(audioDuration)}</span>
              </div>
            </div>
          )}

          {/* Music Controls */}
          {isMusicEnabled && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={previousTrack}
                className="p-2 rounded-full transition-colors duration-300 cursor-pointer"
                style={{
                  backgroundColor: "var(--surface-secondary)",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-secondary)")}
                title="Previous track"
              >
                <SkipBack size={18} />
              </button>
              <button
                onClick={toggleLoop}
                className="p-2 rounded-full transition-colors duration-300 cursor-pointer"
                style={{
                  backgroundColor: isLooping ? "var(--primary)" : "var(--surface-secondary)",
                  color: isLooping ? "#1a1a1a" : "var(--text-primary)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                title={isLooping ? "Loop: On" : "Loop: Off"}
              >
                <Repeat size={18} />
              </button>
              <button
                onClick={nextTrack}
                className="p-2 rounded-full transition-colors duration-300 cursor-pointer"
                style={{
                  backgroundColor: "var(--surface-secondary)",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-secondary)")}
                title="Next track"
              >
                <SkipForward size={18} />
              </button>
            </div>
          )}

          {/* Session Counter */}
          <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
            Sessions Completed: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{sessionsCompleted}</span>
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
