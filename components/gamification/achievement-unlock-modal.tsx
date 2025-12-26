'use client';

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { AchievementDefinition, getAchievementTierClass } from "@/lib/gamification";
import { Trophy, X, Sparkles } from "lucide-react";
import Button from "@/components/ui/button";

interface AchievementUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: AchievementDefinition | null;
  xpGained: number;
}

export default function AchievementUnlockModal({
  isOpen,
  onClose,
  achievement,
  xpGained,
}: AchievementUnlockModalProps) {
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && achievement && mounted) {
      // Play sound effect when modal opens
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.log("Audio play failed:", error);
        });
      }
    }
  }, [isOpen, achievement, mounted]);

  if (!isOpen || !mounted || !achievement) return null;

  const getTierLabel = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

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

        {/* Achievement Icon with glow effect */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-50 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse" />
            <div className="relative text-8xl animate-bounce">
              {achievement.icon}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Achievement Unlocked!
            </h2>
          </div>
        </div>

        {/* Achievement Details */}
        <div className="space-y-4 mb-6">
          {/* Achievement Name */}
          <h3 className="text-2xl font-bold text-center" style={{ color: "var(--text-primary)" }}>
            {achievement.name}
          </h3>

          {/* Badge Tier */}
          <div className="flex justify-center">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getAchievementTierClass(achievement.tier)}`}>
              {getTierLabel(achievement.tier)} Badge
            </span>
          </div>

          {/* Description */}
          <p className="text-center text-base" style={{ color: "var(--text-secondary)" }}>
            {achievement.description}
          </p>

          {/* XP Reward */}
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              +{xpGained} XP Earned
            </span>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            onClick={onClose}
            variant="primary"
            className="px-8 py-3 text-base font-semibold"
          >
            Continue
          </Button>
        </div>

        {/* Audio element */}
        <audio
          ref={audioRef}
          src="/sounds/achievement-unlock.mp3"
          preload="auto"
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
