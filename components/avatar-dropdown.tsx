"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { User, Settings, LogOut } from "lucide-react";
import { getUserInitials } from "@/lib/avatar-utils";

interface AvatarDropdownProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
}

export default function AvatarDropdown({ user }: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toggleTheme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = getUserInitials(user.name, user.email);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer transition-all duration-200"
        style={{
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: isOpen ? "var(--primary)" : "transparent",
        }}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User avatar"}
            width={40}
            height={40}
            className="rounded-full object-cover"
            style={{ width: "40px", height: "40px" }}
            unoptimized={user.image.includes("dicebear.com")}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{
              backgroundColor: "var(--primary)",
              color: "#1a1a1a",
            }}
          >
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-2 z-50"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User avatar"}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                  style={{ width: "48px", height: "48px" }}
                  unoptimized={user.image.includes("dicebear.com")}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#1a1a1a",
                  }}
                >
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {user.name || "User"}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/settings");
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 cursor-pointer"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Settings size={18} />
              Settings
            </button>

            <button
              onClick={() => {
                toggleTheme();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 cursor-pointer"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <ThemeToggle iconOnly />
              Theme
            </button>

            <div className="my-1" style={{ borderTop: "1px solid var(--border)" }} />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 cursor-pointer"
              style={{ color: "#ef4444" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

