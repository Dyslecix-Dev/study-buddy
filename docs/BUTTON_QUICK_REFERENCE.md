# Button Component - Quick Reference

## Import

```tsx
import Button from "@/components/ui/button";
```

## Common Patterns

### Form Submit
```tsx
<Button type="submit" isLoading={loading} variant="primary">
  Submit
</Button>
```

### Cancel
```tsx
<Button type="button" onClick={onCancel} variant="secondary">
  Cancel
</Button>
```

### Delete
```tsx
<Button onClick={handleDelete} variant="danger">
  Delete
</Button>
```

### Success
```tsx
<Button onClick={handleFinish} variant="success">
  Finish
</Button>
```

### With Icon (Left)
```tsx
<Button variant="primary" icon={<Plus size={18} />} iconPosition="left">
  Add New
</Button>
```

### With Icon (Right)
```tsx
<Button variant="primary" icon={<ChevronRight size={18} />} iconPosition="right">
  Next
</Button>
```

### Loading State
```tsx
<Button isLoading={uploading} variant="primary">
  Upload
</Button>
```

### Full Width
```tsx
<Button fullWidth variant="primary">
  Sign In
</Button>
```

### Ghost (Link-style)
```tsx
<Button variant="ghost" size="sm">
  Forgot password?
</Button>
```

### Disabled
```tsx
<Button disabled variant="primary">
  Submit
</Button>
```

## Props Cheat Sheet

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | "primary" | primary, secondary, danger, success, warning, info, ghost |
| `size` | string | "md" | sm, md, lg |
| `isLoading` | boolean | false | Shows spinner, disables button |
| `icon` | ReactNode | - | Icon component (lucide-react) |
| `iconPosition` | string | "left" | "left" or "right" |
| `isIconOnly` | boolean | false | Compact padding for icon-only |
| `fullWidth` | boolean | false | Spans full container width |
| `disabled` | boolean | false | Standard HTML disabled |
| `className` | string | "" | Additional CSS classes |
| `type` | string | "button" | "button", "submit", "reset" |
| `onClick` | function | - | Click handler |

## Variants Visual Guide

```
primary   → Blue background, white text (CTAs)
secondary → Transparent, border, gray text (Cancel)
danger    → Red background, white text (Delete)
success   → Green background, white text (Complete)
warning   → Yellow background, dark text (Caution)
info      → Light blue background, dark text (Info)
ghost     → Transparent, no border (Links)
```

## Size Guide

```
sm → 12px vertical padding, 12px horizontal
md → 16px vertical, 16px horizontal (default)
lg → 24px vertical, 24px horizontal
```

## When NOT to Use Button Component

- ❌ Toolbar icon buttons with active states
- ❌ Colored rating buttons (red/yellow/green)
- ❌ Card indicator buttons with custom borders
- ❌ Theme toggle buttons
- ❌ Navigation menu items
- ❌ Dropdown menu items
- ❌ Tag removal X buttons
- ❌ Graph node buttons

Use native `<button>` for these specialized cases.

## Documentation

Full guide: `BUTTON_COMPONENT_GUIDE.md`
Migration summary: `BUTTON_MIGRATION_SUMMARY.md`
