# UI Components Guide

Reference for custom UI components, design system, and styling conventions.

## Table of Contents
- [Design System](#design-system)
- [Color System](#color-system)
- [Button Component](#button-component)
- [Badge Component](#badge-component)
- [Common Patterns](#common-patterns)

---

## Design System

### Theme System

The app uses CSS custom properties for theming:

```css
/* Light theme (default) */
:root {
  --surface: #ffffff;
  --surface-hover: #f3f4f6;
  --border: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
}

/* Dark theme */
[data-theme="dark"] {
  --surface: #1f2937;
  --surface-hover: #374151;
  --border: #4b5563;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  --primary: #3b82f6;
  --primary-hover: #60a5fa;
}
```

### Using Theme Colors

```tsx
// In inline styles
<div style={{ backgroundColor: "var(--surface)", color: "var(--text-primary)" }}>
  Content
</div>

// In CSS modules
.container {
  background-color: var(--surface);
  color: var(--text-primary);
}
```

### Adding Custom Colors

1. **Define in globals.css:**
```css
:root {
  --custom-color: #hexcode;
}

[data-theme="dark"] {
  --custom-color: #dark-hexcode;
}
```

2. **Use in components:**
```tsx
<div style={{ color: "var(--custom-color)" }}>
  Themed content
</div>
```

---

## Color System

### Semantic Colors

**Status Colors:**
- `--success`: #10b981 (green)
- `--warning`: #f59e0b (yellow)
- `--error`: #ef4444 (red)
- `--info`: #3b82f6 (blue)

**Priority Colors (Tasks):**
- Priority 0 (None): `#6b7280` (gray)
- Priority 1 (Low): `#3b82f6` (blue)
- Priority 2 (Medium): `#f59e0b` (yellow)
- Priority 3 (High): `#ef4444` (red)

**Category Colors (Content Types):**
- Notes: `#2563eb` (blue)
- Tasks: `#16a34a` (green)
- Flashcards: `#9333ea` (purple)
- Folders: `#ca8a04` (yellow)
- Tags: `#dc2626` (red)
- Decks: `#4f46e5` (indigo)

### Tier Colors (Gamification)

- Bronze: `#CD7F32`
- Silver: `#C0C0C0`
- Gold: `#FFD700`
- Platinum: `#E5E4E2`

### Helper Functions

```typescript
// lib/utils.ts
export function getPriorityColor(priority: number): string {
  const colors = {
    0: "#6b7280",
    1: "#3b82f6",
    2: "#f59e0b",
    3: "#ef4444",
  };
  return colors[priority as keyof typeof colors] || colors[0];
}

export function getTierColor(tier: string): string {
  const colors = {
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
    platinum: "#E5E4E2",
  };
  return colors[tier as keyof typeof colors] || colors.bronze;
}
```

---

## Button Component

### Usage

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="md">
  Click me
</Button>
```

### Variants

```tsx
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="primary">Primary</Button>
```

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### With Icons

```tsx
import { Plus, Trash2 } from "lucide-react";

<Button>
  <Plus size={16} />
  Add Item
</Button>

<Button variant="destructive">
  <Trash2 size={16} />
  Delete
</Button>
```

### Loading State

```tsx
<Button disabled={isLoading}>
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

### Full Example

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveData();
    setIsSaving(false);
  };

  return (
    <Button
      variant="primary"
      size="md"
      onClick={handleSave}
      disabled={isSaving}
    >
      <Save size={16} />
      {isSaving ? "Saving..." : "Save"}
    </Button>
  );
}
```

---

## Badge Component

### Achievement Badges

```tsx
import AchievementBadge from "@/components/gamification/achievement-badge";

<AchievementBadge
  achievement={{
    key: "first-note",
    name: "First Note",
    icon: "📝",
    tier: "bronze",
    xpReward: 25,
  }}
  size="lg"
/>
```

Sizes: `sm` (32px), `md` (64px), `lg` (128px)

### Tag Badges

```tsx
import TagBadge from "@/components/tags/tag-badge";

<TagBadge
  tag={{
    id: "tag-1",
    name: "Math",
    color: "#3b82f6",
  }}
  size="sm"
/>
```

### Status Badges

```tsx
<span className="status-badge success">Completed</span>
<span className="status-badge warning">Pending</span>
<span className="status-badge error">Failed</span>
```

CSS:
```css
.status-badge {
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.success {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.warning {
  background: #fef3c7;
  color: #f59e0b;
}

.status-badge.error {
  background: #fee2e2;
  color: #ef4444;
}
```

---

## Common Patterns

### Card Component

```tsx
<div className="card">
  <div className="card-header">
    <h3>Card Title</h3>
    <p>Description</p>
  </div>
  <div className="card-content">
    {/* Content */}
  </div>
  <div className="card-footer">
    <Button>Action</Button>
  </div>
</div>
```

CSS:
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
}

.card-header {
  margin-bottom: 1rem;
}

.card-content {
  margin-bottom: 1rem;
}
```

### Modal/Dialog

```tsx
import { X } from "lucide-react";

{isOpen && (
  <div className="modal-overlay" onClick={() => setIsOpen(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Modal Title</h2>
        <button onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>
      <div className="modal-body">
        {/* Content */}
      </div>
      <div className="modal-footer">
        <Button variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  </div>
)}
```

CSS:
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: var(--surface);
  border-radius: 0.5rem;
  max-width: 32rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border);
}
```

### Loading Spinner

```tsx
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`spinner ${sizeClasses[size]}`}>
      <div className="spinner-inner" />
    </div>
  );
}
```

CSS:
```css
.spinner {
  display: inline-block;
  position: relative;
}

.spinner-inner {
  width: 100%;
  height: 100%;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Toast Notifications

Using `sonner`:

```tsx
import { toast } from "sonner";

// Success
toast.success("Note created successfully!");

// Error
toast.error("Failed to save note");

// Info
toast.info("Syncing in progress...");

// Loading
toast.loading("Saving...");

// Promise
toast.promise(saveNote(), {
  loading: "Saving...",
  success: "Saved!",
  error: "Failed to save",
});
```

Setup in layout:
```tsx
import { Toaster } from "sonner";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" />
    </>
  );
}
```

### Form Pattern

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MyForm() {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed");

      toast.success("Saved successfully!");
      setFormData({ title: "", description: "" });
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
```

---

## Icon System

Using Lucide React:

```tsx
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Check,
  AlertCircle,
  Info,
  Search,
  Filter,
  Calendar,
  Clock,
  Tag,
  Folder,
  FileText,
  Brain,
  CheckSquare,
} from "lucide-react";

<Plus size={16} />
<Trash2 size={20} color="#ef4444" />
<Save size={18} strokeWidth={2} />
```

Common sizes:
- `size={14}` - Small
- `size={16}` - Default
- `size={20}` - Medium
- `size={24}` - Large

---

## Responsive Design

### Breakpoints

```css
/* Mobile first */
.container {
  padding: 1rem;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}
```

### Tailwind Breakpoints

```tsx
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

---

**Last Updated:** December 2024
