# UI Components

## Theme

```css
:root { --surface: #ffffff; --text-primary: #111827; --primary: #3b82f6; }
[data-theme="dark"] { --surface: #1f2937; --text-primary: #f9fafb; }
```

Usage: `<div style={{ color: "var(--text-primary)" }}>Content</div>`

## Colors

**Status:** Success `#10b981`, Warning `#f59e0b`, Error `#ef4444`, Info `#3b82f6`

**Priority:** Low `#6b7280`, Medium `#3b82f6`, High `#ef4444`

**Tiers:** Bronze `#CD7F32`, Silver `#C0C0C0`, Gold `#FFD700`, Platinum `#E5E4E2`

## Button

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="primary" size="lg">Primary</Button>
```

Variants: `default`, `outline`, `ghost`, `destructive`, `primary`
Sizes: `sm`, `md`, `lg`

## Icons

```tsx
import { Plus, Trash2, Save } from "lucide-react";
<Plus size={16} />
```

Sizes: `14` (small), `16` (default), `20` (medium), `24` (large)

## Toast

```tsx
import { toast } from "sonner";

toast.success("Saved!");
toast.error("Failed");
toast.promise(saveNote(), {
  loading: "Saving...",
  success: "Saved!",
  error: "Failed"
});
```

Setup: `import { Toaster } from "sonner"; <Toaster position="bottom-right" />`

## Patterns

**Card:**
```tsx
<div className="card">
  <div className="card-header"><h3>Title</h3></div>
  <div className="card-content">Content</div>
</div>
```

**Modal:**
```tsx
{isOpen && (
  <div className="modal-overlay" onClick={() => setIsOpen(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header"><h2>Title</h2></div>
      <div className="modal-body">Content</div>
      <div className="modal-footer">
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save</Button>
      </div>
    </div>
  </div>
)}
```

**Responsive:**
```tsx
<div className="p-4 md:p-6 lg:p-8">Responsive padding</div>
```
