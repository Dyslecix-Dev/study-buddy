"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface BrokenLinksWarningProps {
  content: string;
  onFix: () => void;
}

export function BrokenLinksWarning({ content, onFix }: BrokenLinksWarningProps) {
  const [brokenLinks, setBrokenLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBrokenLinks = async () => {
      if (!content || content === "<p></p>") return;

      setLoading(true);
      try {
        // Extract note IDs from content
        const noteIds: string[] = [];
        const regex = /data-note-id="([^"]+)"/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
          const noteId = match[1];
          if (!noteIds.includes(noteId)) {
            noteIds.push(noteId);
          }
        }

        if (noteIds.length === 0) {
          setBrokenLinks([]);
          setLoading(false);
          return;
        }

        // Check which notes exist
        const broken: string[] = [];
        for (const noteId of noteIds) {
          try {
            const response = await fetch(`/api/notes/${noteId}`);
            if (!response.ok) {
              broken.push(noteId);
            }
          } catch (error) {
            broken.push(noteId);
          }
        }

        setBrokenLinks(broken);
      } catch (error) {
        console.error("Error checking broken links:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(checkBrokenLinks, 2000);
    return () => clearTimeout(timeoutId);
  }, [content]);

  if (loading || brokenLinks.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3"
      style={{
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderLeftColor: "#ef4444",
      }}
    >
      <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-red-900 mb-1">Broken Links Detected</h4>
        <p className="text-sm text-red-800 mb-2">
          This note contains {brokenLinks.length} link{brokenLinks.length > 1 ? "s" : ""} to deleted notes.
        </p>
        <button onClick={onFix} className="text-sm font-medium text-red-600 hover:text-red-700 underline cursor-pointer">
          Remove broken links
        </button>
      </div>
      <button onClick={() => setBrokenLinks([])} className="text-red-600 hover:text-red-700">
        <X size={16} />
      </button>
    </div>
  );
}

