"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";

type TimerMode = "work" | "shortBreak" | "longBreak";
type MusicGenre = "jazz" | "edm" | "hiphop";

interface TimerContextType {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  isMusicEnabled: boolean;
  musicGenre: MusicGenre;
  currentTrackIndex: number;
  isLooping: boolean;
  currentTrackName: string;
  audioProgress: number;
  audioDuration: number;
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
  toggleMusic: () => void;
  setMusicGenre: (genre: MusicGenre) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleLoop: () => void;
  seekAudio: (time: number) => void;
  onSessionComplete?: (mode: TimerMode, duration: number) => void;
  setOnSessionComplete: (callback: (mode: TimerMode, duration: number) => void) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const DEFAULT_DURATIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

// TODO Add rest of music
const MUSIC_PLAYLISTS: Record<MusicGenre, Record<TimerMode, { name: string; path: string }[]>> = {
  jazz: {
    work: [{ name: "Down the Street", path: "/audio/jazz/down-the-street.mp3" }],
    shortBreak: [{ name: "Downtown Boogie", path: "/audio/jazz/downtown-boogie.mp3" }],
    longBreak: [{ name: "Moonlit Romance", path: "/audio/jazz/moonlit-romance.mp3" }],
  },
  edm: {
    work: [{ name: "Adrenaline Rush", path: "/audio/edm/adrenaline-rush.mp3" }],
    shortBreak: [{ name: "Alternating Current", path: "/audio/edm/alternating-current.mp3" }],
    longBreak: [{ name: "Future Unseen", path: "/audio/edm/future-unseen.mp3" }],
  },
  hiphop: {
    work: [{ name: "8-Bit Glitch", path: "/audio/hiphop/8-bit-glitch.mp3" }],
    shortBreak: [{ name: "Above the Clouds", path: "/audio/hiphop/above-the-clouds.mp3" }],
    longBreak: [{ name: "Center of Attention", path: "/audio/hiphop/center-of-attention.mp3" }],
  },
};

export function TimerProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [customDurations, setCustomDurations] = useState(DEFAULT_DURATIONS);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [musicGenre, setMusicGenreState] = useState<MusicGenre>("jazz");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [onSessionComplete, setOnSessionComplete] = useState<((mode: TimerMode, duration: number) => void) | undefined>();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get current playlist based on mode and genre
  const getCurrentPlaylist = useCallback(() => {
    return MUSIC_PLAYLISTS[musicGenre][mode];
  }, [musicGenre, mode]);

  // Get current track
  const getCurrentTrack = useCallback(() => {
    const playlist = getCurrentPlaylist();
    return playlist[currentTrackIndex] || playlist[0];
  }, [getCurrentPlaylist, currentTrackIndex]);

  const currentTrackName = getCurrentTrack().name;

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.3;

      // Handle track end - play next track or loop current
      const handleTrackEnd = () => {
        if (isLooping) {
          audioRef.current?.play();
        } else {
          const playlist = getCurrentPlaylist();
          const nextIndex = (currentTrackIndex + 1) % playlist.length;
          setCurrentTrackIndex(nextIndex);
        }
      };

      // Update progress as track plays
      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setAudioProgress(audioRef.current.currentTime);
        }
      };

      // Update duration when metadata loads
      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setAudioDuration(audioRef.current.duration);
        }
      };

      audioRef.current.addEventListener("ended", handleTrackEnd);
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("ended", handleTrackEnd);
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
          audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [isLooping, currentTrackIndex, getCurrentPlaylist]);

  // Handle music playback based on timer state, mode, genre, and track
  useEffect(() => {
    if (!audioRef.current || !isMusicEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const audio = audioRef.current;
    const currentTrack = getCurrentTrack();
    const trackPath = currentTrack.path;

    // If the track has changed, update the source
    if (audio.src !== window.location.origin + trackPath) {
      audio.src = trackPath;
      audio.load();
    }

    if (isRunning) {
      // Play music when timer is running
      audio.play().catch((error) => {
        // Auto-play might be blocked by browser
        console.log("Audio play prevented:", error);
      });
    } else {
      // Pause music when timer is paused
      audio.pause();
    }
  }, [isRunning, mode, isMusicEnabled, currentTrackIndex, musicGenre, getCurrentTrack]);

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

  const updateCustomDurations = useCallback(
    (durations: typeof DEFAULT_DURATIONS) => {
      setCustomDurations(durations);
      setTimeLeft(durations[mode]);
    },
    [mode]
  );

  const toggleMusic = useCallback(() => {
    setIsMusicEnabled((prev) => !prev);
  }, []);

  const setMusicGenre = useCallback((genre: MusicGenre) => {
    setMusicGenreState(genre);
    setCurrentTrackIndex(0); // Reset to first track when changing genre
  }, []);

  const nextTrack = useCallback(() => {
    const playlist = getCurrentPlaylist();
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  }, [getCurrentPlaylist]);

  const previousTrack = useCallback(() => {
    const playlist = getCurrentPlaylist();
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  }, [getCurrentPlaylist]);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const seekAudio = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioProgress(time);
    }
  }, []);

  return (
    <TimerContext.Provider
      value={{
        mode,
        timeLeft,
        isRunning,
        sessionsCompleted,
        isMusicEnabled,
        musicGenre,
        currentTrackIndex,
        isLooping,
        currentTrackName,
        audioProgress,
        audioDuration,
        customDurations,
        startTimer,
        pauseTimer,
        resetTimer,
        setMode,
        setCustomDurations: updateCustomDurations,
        toggleMusic,
        setMusicGenre,
        nextTrack,
        previousTrack,
        toggleLoop,
        seekAudio,
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

