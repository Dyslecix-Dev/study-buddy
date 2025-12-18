"use client";

import Link from "next/link";
import SearchTrigger from "@/components/search/search-trigger";
import { ThemeToggle } from "@/components/theme-toggle";
import LogoutButton from "@/components/logout-button";

export default function DashboardNav() {
  return (
    <nav style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            <Link href="/dashboard">Study Buddy</Link>
          </h2>
          <div className="flex items-center gap-4">
            <SearchTrigger />
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

