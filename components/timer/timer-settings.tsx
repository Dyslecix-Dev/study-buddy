"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TimerSettingsProps {
  currentDurations: {
    work: number;
    shortBreak: number;
    longBreak: number;
  };
  onSave: (durations: { work: number; shortBreak: number; longBreak: number }) => void;
  onClose: () => void;
}

export default function TimerSettings({ currentDurations, onSave, onClose }: TimerSettingsProps) {
  const [workMinutes, setWorkMinutes] = useState(Math.floor(currentDurations.work / 60));
  const [shortBreakMinutes, setShortBreakMinutes] = useState(Math.floor(currentDurations.shortBreak / 60));
  const [longBreakMinutes, setLongBreakMinutes] = useState(Math.floor(currentDurations.longBreak / 60));

  const handleSave = () => {
    onSave({
      work: workMinutes * 60,
      shortBreak: shortBreakMinutes * 60,
      longBreak: longBreakMinutes * 60,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="rounded-lg p-6 max-w-md w-full mx-4" style={{ backgroundColor: "var(--surface)" }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Timer Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors duration-300 cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 mb-6">
          {/* Work Duration */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              Focus Time (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={workMinutes}
              onChange={(e) => setWorkMinutes(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--surface-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Short Break Duration */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              Short Break (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={shortBreakMinutes}
              onChange={(e) => setShortBreakMinutes(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--surface-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Long Break Duration */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              Long Break (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={longBreakMinutes}
              onChange={(e) => setLongBreakMinutes(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--surface-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-md font-medium transition-colors duration-300 cursor-pointer"
            style={{
              backgroundColor: "var(--surface-secondary)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-secondary)")}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-md font-medium transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: "var(--primary)",
              color: "#1a1a1a",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
