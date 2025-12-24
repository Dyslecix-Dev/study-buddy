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
  isMusicPlaying: boolean;
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
  playMusic: () => void;
  pauseMusic: () => void;
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
    work: [
      { name: "Down the Street", path: "/audio/jazz/down-the-street.mp3" },
      { name: "Poor Man's Waltz", path: "/audio/jazz/poor-mans-waltz.mp3" },
    ],
    shortBreak: [
      { name: "Downtown Boogie", path: "/audio/jazz/downtown-boogie.mp3" },
      { name: "Sexual Tension", path: "/audio/jazz/sexual-tension.mp3" },
    ],
    longBreak: [
      { name: "Moonlit Romance", path: "/audio/jazz/moonlit-romance.mp3" },
      { name: "Street Symphony", path: "/audio/jazz/street-symphony.mp3" },
    ],
  },
  edm: {
    work: [
      { name: "Adrenaline Rush", path: "/audio/edm/adrenaline-rush.mp3" },
      { name: "Midnight Happy Hour", path: "/audio/edm/midnight-happy-hour.mp3" },
    ],
    shortBreak: [
      { name: "Alternating Current", path: "/audio/edm/alternating-current.mp3" },
      { name: "Mumble Rap", path: "/audio/edm/mumble-rap.mp3" },
    ],
    longBreak: [
      { name: "Future Unseen", path: "/audio/edm/future-unseen.mp3" },
      { name: "Muted Club", path: "/audio/edm/muted-club.mp3" },
    ],
  },
  hiphop: {
    work: [
      { name: "8-Bit Glitch", path: "/audio/hiphop/8-bit-glitch.mp3" },
      { name: "Chamomile Dreams", path: "/audio/hiphop/chamomile-dreams.mp3" },
    ],
    shortBreak: [
      { name: "Above the Clouds", path: "/audio/hiphop/above-the-clouds.mp3" },
      { name: "Filthy Rich", path: "/audio/hiphop/filthy-rich.mp3" },
    ],
    longBreak: [
      { name: "Center of Attention", path: "/audio/hiphop/center-of-attention.mp3" },
      { name: "Forsaken and Forlorn", path: "/audio/hiphop/forsaken-and-forlorn.mp3" },
    ],
  },
};

export function TimerProvider({ children }: { children: ReactNode }) {
  // Load initial state from localStorage
  const [mode, setModeState] = useState<TimerMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerMode");
      return (saved as TimerMode) || "work";
    }
    return "work";
  });

  const [customDurations, setCustomDurations] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerCustomDurations");
      return saved ? JSON.parse(saved) : DEFAULT_DURATIONS;
    }
    return DEFAULT_DURATIONS;
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerTimeLeft");
      const savedMode = localStorage.getItem("timerMode") as TimerMode;
      const savedDurations = localStorage.getItem("timerCustomDurations");
      const durations = savedDurations ? JSON.parse(savedDurations) : DEFAULT_DURATIONS;
      return saved ? parseInt(saved) : durations[savedMode || "work"];
    }
    return DEFAULT_DURATIONS.work;
  });

  const [isRunning, setIsRunning] = useState(false);

  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerSessionsCompleted");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerMusicEnabled");
      return saved === "true";
    }
    return false;
  });

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const [musicGenre, setMusicGenreState] = useState<MusicGenre>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerMusicGenre");
      return (saved as MusicGenre) || "jazz";
    }
    return "jazz";
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerTrackIndex");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  const [isLooping, setIsLooping] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerIsLooping");
      return saved === "true";
    }
    return false;
  });

  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [onSessionComplete, setOnSessionComplete] = useState<((mode: TimerMode, duration: number) => void) | undefined>();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerCompleteRef = useRef(false);
  const shouldAutoPlayNextTrack = useRef(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("timerMode", mode);
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("timerTimeLeft", timeLeft.toString());
    }
  }, [timeLeft]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("timerCustomDurations", JSON.stringify(customDurations));
    }
  }, [customDurations]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("timerSessionsCompleted", sessionsCompleted.toString());
    }
  }, [sessionsCompleted]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("timerMusicEnabled", isMusicEnabled.toString());
    }
  }, [isMusicEnabled]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("timerMusicGenre", musicGenre);
    }
  }, [musicGenre]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("timerTrackIndex", currentTrackIndex.toString());
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("timerIsLooping", isLooping.toString());
    }
  }, [isLooping]);

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

  // Initialize audio element (only once)
  useEffect(() => {
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.3;

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

      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
          audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, []);

  // Handle track end separately - play next track or loop current
  useEffect(() => {
    if (!audioRef.current) return;

    const handleTrackEnd = () => {
      if (isLooping) {
        // Loop current track
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      } else if (isMusicEnabled) {
        // Mark that we should auto-play the next track
        shouldAutoPlayNextTrack.current = true;
        // Move to next track
        const playlist = getCurrentPlaylist();
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        setCurrentTrackIndex(nextIndex);
      }
    };

    audioRef.current.addEventListener("ended", handleTrackEnd);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleTrackEnd);
      }
    };
  }, [isLooping, currentTrackIndex, getCurrentPlaylist, isMusicEnabled]);

  // Handle track changes - update audio source when track, mode, or genre changes
  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const audio = audioRef.current;
    const currentTrack = getCurrentTrack();
    const trackPath = currentTrack.path;

    // If the track has changed, update the source
    if (audio.src !== window.location.origin + trackPath) {
      const shouldAutoPlay = shouldAutoPlayNextTrack.current || isMusicPlaying || (!audio.paused && isMusicEnabled);

      audio.src = trackPath;
      audio.load();

      // Auto-play the new track if music was playing or should be playing
      if (shouldAutoPlay && isMusicEnabled) {
        audio.play().catch(() => {
          setIsMusicPlaying(false);
        });
      }

      // Reset the auto-play flag
      shouldAutoPlayNextTrack.current = false;
    }
  }, [mode, isMusicEnabled, currentTrackIndex, musicGenre, getCurrentTrack, isMusicPlaying]);

  // Sync audio playback with isMusicPlaying state
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    // Add listeners to keep isMusicPlaying in sync with actual audio state
    const handlePlay = () => {
      setIsMusicPlaying(true);
    };

    const handlePause = () => {
      // Don't update isMusicPlaying to false if the track ended
      // The track end handler will set the flag before pausing
      if (!shouldAutoPlayNextTrack.current) {
        setIsMusicPlaying(false);
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Sync playback state
    if (isMusicEnabled && isMusicPlaying && audio.paused) {
      audio.play().catch(() => {});
    } else if (!isMusicPlaying && !audio.paused) {
      audio.pause();
    } else if (!isMusicEnabled && !audio.paused) {
      audio.pause();
    }

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [isMusicPlaying, isMusicEnabled]);

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
      timerCompleteRef.current = false;
      interval = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            // Timer is about to complete
            if (!timerCompleteRef.current) {
              timerCompleteRef.current = true;
              // Use setTimeout to avoid setState in effect
              setTimeout(() => handleTimerComplete(), 0);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
    setIsMusicEnabled((prev) => {
      const newValue = !prev;
      if (!newValue) {
        // If disabling music, stop playback
        setIsMusicPlaying(false);
      }
      return newValue;
    });
  }, []);

  const playMusic = useCallback(() => {
    if (isMusicEnabled) {
      setIsMusicPlaying(true);
    }
  }, [isMusicEnabled]);

  const pauseMusic = useCallback(() => {
    setIsMusicPlaying(false);
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
        isMusicPlaying,
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
        playMusic,
        pauseMusic,
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

