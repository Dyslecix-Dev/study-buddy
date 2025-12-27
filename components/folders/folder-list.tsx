"use client";

import Link from "next/link";
import { Folder as FolderIcon, Edit2, Trash2, FileText, Share2, Download } from "lucide-react";

interface Folder {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  _count: {
    notes: number;
  };
}

interface FolderListProps {
  folders: Folder[];
  onEdit: (folder: Folder) => void;
  onDelete: (id: string) => void;
  onShare?: (folder: Folder) => void;
  onExport?: (folderId: string) => void;
}

const colorClasses: { [key: string]: string } = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  pink: "bg-pink-100 text-pink-700",
  default: "bg-gray-100 text-gray-700",
};

export default function FolderList({ folders, onEdit, onDelete, onShare, onExport }: FolderListProps) {
  if (folders.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg shadow" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
        <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No folders yet. Create one to organize your notes!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {folders.map((folder) => {
        const colorClass = colorClasses[folder.color || "default"] || colorClasses.default;

        return (
          <div key={folder.id} className="rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden" style={{ backgroundColor: "var(--surface)" }}>
            <div className={`p-4 ${colorClass}`}>
              <div className="flex items-center justify-between">
                <FolderIcon size={24} />
                <span className="text-sm font-medium">{folder._count.notes} notes</span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                {folder.name}
              </h3>
              {folder.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{folder.description}</p>}

              <div className="flex gap-2">
                <Link
                  href={`/notes/${folder.id}`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--surface)",
                    borderWidth: "1px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface)")}
                >
                  <FileText size={16} className="mr-1" />
                  View Notes
                </Link>
                {onExport && (
                  <button
                    onClick={() => onExport(folder.id)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                      backgroundColor: "var(--surface)",
                      borderWidth: "1px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface)")}
                    title="Export folder as Markdown"
                  >
                    <Download size={16} />
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={() => onShare(folder)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--primary)",
                      backgroundColor: "var(--surface)",
                      borderWidth: "1px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface)")}
                    title="Share folder"
                  >
                    <Share2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => onEdit(folder)}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--surface)",
                    borderWidth: "1px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface)")}
                  title="Edit folder"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(folder.id)}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-red-700 transition-colors duration-300 cursor-pointer"
                  style={{
                    borderColor: "#fca5a5",
                    backgroundColor: "var(--surface)",
                    borderWidth: "1px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface)")}
                  title="Delete folder"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

