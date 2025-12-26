'use client';

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, TrendingUp } from "lucide-react";
import Button from "@/components/ui/button";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
}

export default function LevelUpModal({
  isOpen,
  onClose,
  oldLevel,
  newLevel,
}: LevelUpModalProps) {
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      // Play sound effect when modal opens
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.log("Audio play failed:", error);
        });
      }
    }
  }, [isOpen, mounted]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative animate-in zoom-in-95 duration-300"
        style={{
          backgroundColor: "var(--surface)",
          border: "2px solid var(--border)",
          zIndex: 100000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
        </button>

        {/* Level Up Icon with glow effect */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-60 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 animate-pulse" />
            <div className="relative">
              <div className="text-8xl animate-bounce">🎉</div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              Level Up!
            </h2>
          </div>
        </div>

        {/* Level Display */}
        <div className="space-y-6 mb-6">
          {/* Old to New Level Animation */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Previous
              </span>
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600 border-4 border-gray-300 dark:border-gray-700">
                <span className="text-3xl font-bold text-white">{oldLevel}</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
            </div>

            <div className="flex flex-col items-center">
              <span className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                New Level
              </span>
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 border-4 border-purple-300 dark:border-purple-700 animate-pulse shadow-lg shadow-purple-500/50">
                <span className="text-3xl font-bold text-white">{newLevel}</span>
              </div>
            </div>
          </div>

          {/* Congratulations Message */}
          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20">
            <p className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Congratulations!
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              You've reached level {newLevel}! Keep up the great work!
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            onClick={onClose}
            variant="primary"
            className="px-8 py-3 text-base font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600"
          >
            Continue
          </Button>
        </div>

        {/* Audio element */}
        <audio
          ref={audioRef}
          src="/sounds/level-up.mp3"
          preload="auto"
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
