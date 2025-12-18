"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchTrigger from "@/components/search/search-trigger";
import { ThemeToggle } from "@/components/theme-toggle";
import LogoutButton from "@/components/logout-button";
import { Menu, X, ChevronDown, FileText, CheckSquare, Brain, Calendar as CalendarIcon, Timer } from "lucide-react";

export default function DashboardNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Flashcards", href: "/flashcards", icon: Brain },
    { name: "Focus", href: "/focus", icon: Timer },
    { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            <Link href="/dashboard">Study Buddy</Link>
          </h2>

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
              <ThemeToggle />
              <LogoutButton />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md cursor-pointer transition-colors duration-300"
              style={{ color: "var(--text-primary)" }}
            >
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
          </div>
          <div className="pt-4 pb-3 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-around px-5">
              <SearchTrigger />
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

