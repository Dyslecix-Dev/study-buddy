"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SearchTrigger from "@/components/search/search-trigger";
import AvatarDropdown from "@/components/avatar-dropdown";
import { Menu, X, FileText, CheckSquare, Brain, Timer, BookOpen, Settings, LogOut, Search, Bug } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { getUserInitials } from "@/lib/avatar-utils";
import ReportBugModal from "@/components/ui/report-bug-modal";

interface MobileProfileButtonsProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
  isLoading: boolean;
  onItemClick: () => void;
}

function MobileProfileButtons({ user, isLoading, onItemClick }: MobileProfileButtonsProps) {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const initials = getUserInitials(user.name, user.email);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Settings */}
      <button
        onClick={() => {
          onItemClick();
          router.push("/settings");
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        <Settings size={20} />
        Settings
      </button>

      {/* Theme */}
      <button
        onClick={() => {
          toggleTheme();
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        <ThemeToggle iconOnly />
        Theme
      </button>

      {/* Report Bug */}
      <button
        onClick={() => {
          setIsReportModalOpen(true);
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        <Bug size={20} />
        Report Bug
      </button>

      {/* Search + Avatar */}
      <div className="flex items-center gap-3 px-3 py-2">
        <Search size={20} style={{ color: "var(--text-secondary)" }} />
        <div className="flex-1 text-base font-medium" style={{ color: "var(--text-secondary)" }}>
          Search
        </div>
        {isLoading ? (
          <div
            className="w-10 h-10 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--surface-secondary)" }}
          />
        ) : (
          user.image ? (
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
          )
        )}
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          onItemClick();
          handleLogout();
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
        style={{ color: "#ef4444" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <LogOut size={20} />
        Logout
      </button>

      <ReportBugModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userEmail={user.email}
        userName={user.name}
      />
    </>
  );
}

export default function DashboardNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const response = await fetch(`/api/users/${authUser.id}`);
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const navigation = [
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Flashcards", href: "/flashcards", icon: Brain },
    { name: "Exams", href: "/exams", icon: BookOpen },
    { name: "Focus", href: "/focus", icon: Timer },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard">
            <Image src="/images/study-buddy-logo.png" alt="Study Buddy logo" width={320} height={40} className="w-80 h-12" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                  style={{
                    color: isActive(item.href) ? "var(--primary)" : "var(--text-secondary)",
                    backgroundColor: isActive(item.href) ? "var(--surface-secondary)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <SearchTrigger />
              {isLoading ? (
                <div
                  className="w-10 h-10 rounded-full animate-pulse"
                  style={{ backgroundColor: "var(--surface-secondary)" }}
                />
              ) : (
                user && <AvatarDropdown user={user} />
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-md cursor-pointer transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden" style={{ backgroundColor: "var(--surface)", borderTop: "1px solid var(--border)" }}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
                  style={{
                    color: isActive(item.href) ? "var(--primary)" : "var(--text-secondary)",
                    backgroundColor: isActive(item.href) ? "var(--surface-secondary)" : "transparent",
                  }}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}

            {user && <MobileProfileButtons user={user} isLoading={isLoading} onItemClick={() => setMobileMenuOpen(false)} />}
          </div>
        </div>
      )}
    </nav>
  );
}

