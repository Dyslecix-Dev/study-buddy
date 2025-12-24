"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardNav from "@/components/dashboard-nav";
import { KnowledgeGraph } from "@/components/graph/knowledge-graph";

export default function FolderGraphPage({ params }: { params: Promise<{ folderId: string }> }) {
  const { folderId } = use(params);
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/notes/${folderId}`}
            className="text-sm transition-colors duration-300"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            ← Back to Folder
          </Link>
        </div>

        <KnowledgeGraph folderId={folderId} />
      </div>
    </div>
  );
}
