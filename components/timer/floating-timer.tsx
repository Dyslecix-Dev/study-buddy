"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Timer, Play, Pause, X, Maximize2, Music, SkipForward, SkipBack, Repeat, Coffee, Clock } from "lucide-react";
import { useTimer } from "@/contexts/timer-context";

export default function FloatingTimer() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    mode,
    timeLeft,
    isRunning,
    isMusicEnabled,
    isMusicPlaying,
    musicGenre,
    isLooping,
    currentTrackName,
    audioProgress,
    audioDuration,
    startTimer,
    pauseTimer,
    setMode,
    toggleMusic,
    playMusic,
    pauseMusic,
    setMusicGenre,
    nextTrack,
    previousTrack,
    toggleLoop,
    seekAudio,
  } = useTimer();
  const [isMinimized, setIsMinimized] = useState(true);

  // Don't show on focus page or login/signup pages
  if (pathname?.startsWith("/focus") || pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname === "/") {
    return null;
  }

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

      {/* Mode Selector */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setMode("work")}
          className="flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-300 cursor-pointer"
          style={{
            backgroundColor: mode === "work" ? getModeColor() : "var(--surface-secondary)",
            color: mode === "work" ? "white" : "var(--text-secondary)",
          }}
          title="Focus"
        >
          <Clock size={12} className="mx-auto" />
        </button>
        <button
          onClick={() => setMode("shortBreak")}
          className="flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-300 cursor-pointer"
          style={{
            backgroundColor: mode === "shortBreak" ? getModeColor() : "var(--surface-secondary)",
            color: mode === "shortBreak" ? "white" : "var(--text-secondary)",
          }}
          title="Short Break"
        >
          <Coffee size={12} className="mx-auto" />
        </button>
        <button
          onClick={() => setMode("longBreak")}
          className="flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-300 cursor-pointer"
          style={{
            backgroundColor: mode === "longBreak" ? getModeColor() : "var(--surface-secondary)",
            color: mode === "longBreak" ? "white" : "var(--text-secondary)",
          }}
          title="Long Break"
        >
          <Coffee size={14} className="mx-auto" />
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-3">
        <div className="text-4xl font-bold mb-1" style={{ color: getModeColor() }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex justify-center mb-3">
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

      {/* Music Section */}
      <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
        {/* Genre Selection & Toggle */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1">
            <button
              onClick={() => setMusicGenre("jazz")}
              className="px-2 py-1 rounded text-xs font-medium transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: musicGenre === "jazz" ? "var(--primary)" : "var(--surface-secondary)",
                color: musicGenre === "jazz" ? "#1a1a1a" : "var(--text-secondary)",
              }}
              title="Jazz"
            >
              Jazz
            </button>
            <button
              onClick={() => setMusicGenre("edm")}
              className="px-2 py-1 rounded text-xs font-medium transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: musicGenre === "edm" ? "var(--primary)" : "var(--surface-secondary)",
                color: musicGenre === "edm" ? "#1a1a1a" : "var(--text-secondary)",
              }}
              title="EDM"
            >
              EDM
            </button>
            <button
              onClick={() => setMusicGenre("hiphop")}
              className="px-2 py-1 rounded text-xs font-medium transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: musicGenre === "hiphop" ? "var(--primary)" : "var(--surface-secondary)",
                color: musicGenre === "hiphop" ? "#1a1a1a" : "var(--text-secondary)",
              }}
              title="Hip-Hop"
            >
              Hip-Hop
            </button>
          </div>
          <button
            onClick={toggleMusic}
            className="p-1 rounded transition-colors duration-300 cursor-pointer"
            style={{
              backgroundColor: isMusicEnabled ? "var(--primary)" : "var(--surface-secondary)",
              color: isMusicEnabled ? "#1a1a1a" : "var(--text-primary)",
            }}
            title={isMusicEnabled ? "Music on" : "Music off"}
          >
            <Music size={14} style={{ opacity: isMusicEnabled ? 1 : 0.5 }} />
          </button>
        </div>

        {/* Current Track & Controls */}
        {isMusicEnabled && (
          <>
            <div className="mb-2">
              <p className="text-xs text-center truncate mb-2" style={{ color: "var(--text-secondary)" }}>
                {currentTrackName}
              </p>

              {/* Audio Scrubber */}
              <div className="mb-1">
                <input
                  type="range"
                  min="0"
                  max={audioDuration || 100}
                  value={audioProgress}
                  onChange={(e) => seekAudio(Number(e.target.value))}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(audioProgress / (audioDuration || 1)) * 100}%, var(--border) ${
                      (audioProgress / (audioDuration || 1)) * 100
                    }%, var(--border) 100%)`,
                  }}
                />
              </div>

              {/* Time Display */}
              <div className="flex justify-between text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                <span>{formatAudioTime(audioProgress)}</span>
                <span>{formatAudioTime(audioDuration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1">
              <button
                onClick={previousTrack}
                className="p-1 rounded transition-colors duration-300 cursor-pointer"
                style={{
                  backgroundColor: "var(--surface-secondary)",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-secondary)")}
                title="Previous track"
              >
                <SkipBack size={14} />
              </button>
              <button
                onClick={isMusicPlaying ? pauseMusic : playMusic}
                className="p-1.5 rounded transition-colors duration-300 cursor-pointer"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "#1a1a1a",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                title={isMusicPlaying ? "Pause music" : "Play music"}
              >
                {isMusicPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                onClick={toggleLoop}
                className="p-1 rounded transition-colors duration-300 cursor-pointer"
                style={{
                  backgroundColor: isLooping ? "var(--primary)" : "var(--surface-secondary)",
                  color: isLooping ? "#1a1a1a" : "var(--text-primary)",
                }}
                title={isLooping ? "Loop: On" : "Loop: Off"}
              >
                <Repeat size={14} />
              </button>
              <button
                onClick={nextTrack}
                className="p-1 rounded transition-colors duration-300 cursor-pointer"
                style={{
                  backgroundColor: "var(--surface-secondary)",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-secondary)")}
                title="Next track"
              >
                <SkipForward size={14} />
              </button>
            </div>
          </>
        )}
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

