"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

interface ThemeToggleProps {
  iconOnly?: boolean;
}

export function ThemeToggle({ iconOnly = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const icon = theme === "light" ? <Moon size={18} /> : <Sun size={18} />;

  if (iconOnly) {
    return icon;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors duration-300 cursor-pointer"
      style={{
        backgroundColor: "var(--surface)",
        color: "var(--text-primary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--surface)";
      }}
      aria-label="Toggle theme"
    >
      {icon}
    </button>
  );
}

