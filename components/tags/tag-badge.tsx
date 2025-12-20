"use client";

import { X } from "lucide-react";
import { getTagColorClasses, Tag } from "@/lib/tag-utils";

interface TagBadgeProps {
  tag: Tag;
  onRemove?: (tagId: string) => void;
  showRemove?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function TagBadge({ tag, onRemove, showRemove = false, size = "md" }: TagBadgeProps) {
  const { bgClass, textClass, borderClass } = getTagColorClasses(tag.color);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${bgClass} ${textClass} ${borderClass} ${sizeClasses[size]}`}>
      {tag.name}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag.id);
          }}
          className={`rounded-full hover:bg-black/10 transition-colors cursor-pointer ${size === "sm" ? "p-0.5" : "p-1"}`}
          aria-label={`Remove ${tag.name} tag`}
        >
          <X className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
        </button>
      )}
    </span>
  );
}

