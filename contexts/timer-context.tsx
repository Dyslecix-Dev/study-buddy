"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type TimerMode = "work" | "shortBreak" | "longBreak";

interface TimerContextType {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  customDurations: {
    work: number;
    shortBreak: number;
    longBreak: number;
  };
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: TimerMode) => void;
  setCustomDurations: (durations: { work: number; shortBreak: number; longBreak: number }) => void;
  onSessionComplete?: (mode: TimerMode, duration: number) => void;
  setOnSessionComplete: (callback: (mode: TimerMode, duration: number) => void) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const DEFAULT_DURATIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function TimerProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [customDurations, setCustomDurations] = useState(DEFAULT_DURATIONS);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [onSessionComplete, setOnSessionComplete] = useState<((mode: TimerMode, duration: number) => void) | undefined>();

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }, []);

  const handleTimerComplete = useCallback(() => {
    playNotificationSound();

    // Calculate actual duration completed
    const duration = customDurations[mode];

    // Log the session
    if (onSessionComplete) {
      onSessionComplete(mode, duration / 60);
    }

    // Auto-switch to next mode
    if (mode === "work") {
      const newSessionCount = sessionsCompleted + 1;
      setSessionsCompleted(newSessionCount);

      // Every 4 work sessions, take a long break
      if (newSessionCount % 4 === 0) {
        setModeState("longBreak");
        setTimeLeft(customDurations.longBreak);
      } else {
        setModeState("shortBreak");
        setTimeLeft(customDurations.shortBreak);
      }
    } else {
      setModeState("work");
      setTimeLeft(customDurations.work);
    }

    setIsRunning(false);
  }, [mode, customDurations, sessionsCompleted, onSessionComplete, playNotificationSound]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerComplete]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(customDurations[mode]);
  }, [mode, customDurations]);

  const setMode = useCallback(
    (newMode: TimerMode) => {
      setModeState(newMode);
      setTimeLeft(customDurations[newMode]);
      setIsRunning(false);
    },
    [customDurations]
  );

  const updateCustomDurations = useCallback((durations: typeof DEFAULT_DURATIONS) => {
    setCustomDurations(durations);
    setTimeLeft(durations[mode]);
  }, [mode]);

  return (
    <TimerContext.Provider
      value={{
        mode,
        timeLeft,
        isRunning,
        sessionsCompleted,
        customDurations,
        startTimer,
        pauseTimer,
        resetTimer,
        setMode,
        setCustomDurations: updateCustomDurations,
        onSessionComplete,
        setOnSessionComplete: (callback) => setOnSessionComplete(() => callback),
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
