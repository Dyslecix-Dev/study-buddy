# Button Component Documentation

## Overview

The `Button` component is a reusable, fully-featured button component that provides consistent styling, behavior, and accessibility across the entire Study Buddy application.

**Location:** `/components/ui/button.tsx`

## Features

- ✅ **7 Variants**: primary, secondary, danger, success, warning, info, ghost
- ✅ **3 Sizes**: sm, md, lg
- ✅ **Loading States**: Built-in spinner with automatic loading text handling
- ✅ **Icon Support**: Left or right positioned icons, icon-only mode
- ✅ **Disabled States**: Proper opacity and cursor handling
- ✅ **Transitions**: Consistent duration-300 transitions
- ✅ **Full Width**: Optional fullWidth prop for responsive layouts
- ✅ **Accessibility**: All standard button HTML attributes supported

## Basic Usage

```tsx
import Button from "@/components/ui/button";

// Simple button
<Button variant="primary">Click me</Button>

// Button with loading state
<Button variant="primary" isLoading={loading}>
  Submit
</Button>

// Button with icon
<Button variant="secondary" icon={<Plus size={18} />} iconPosition="left">
  Add Item
</Button>

// Full width button
<Button variant="success" fullWidth>
  Finish
</Button>
```

## Props API

### ButtonProps Interface

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  isIconOnly?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}
```

### Variant Options

| Variant | Color | Use Case | Example |
|---------|-------|----------|---------|
| `primary` | Blue | Main actions, submit buttons | "Sign in", "Create Task" |
| `secondary` | Transparent with border | Cancel actions, alternative options | "Cancel", "Back" |
| `danger` | Red | Destructive actions | "Delete", "Logout" |
| `success` | Green | Positive confirmations | "Finish Session", "Complete" |
| `warning` | Yellow | Cautionary actions | Form validation feedback |
| `info` | Light Blue | Informational actions | Neutral feedback |
| `ghost` | Transparent, no border | Link-style buttons | "Forgot password?", "Back to login" |

### Size Options

| Size | Padding | Text Size | Use Case |
|------|---------|-----------|----------|
| `sm` | `px-3 py-1.5` | `text-sm` | Compact UI, inline buttons |
| `md` | `px-4 py-2` | `text-sm` | Default, most common |
| `lg` | `px-6 py-3` | `text-base` | Prominent actions, CTAs |

### Special Props

- **`isLoading`**: Shows spinner, disables button, hides text if loading
- **`icon`**: ReactNode to display as icon (use lucide-react icons)
- **`iconPosition`**: "left" or "right" placement
- **`isIconOnly`**: Removes padding for icon-only buttons (toolbar buttons)
- **`fullWidth`**: Makes button span full width of container
- **`disabled`**: Standard HTML disabled attribute
- **`className`**: Additional CSS classes (merged with component styles)

## Examples by Use Case

### Forms

```tsx
// Submit button with loading
<Button type="submit" isLoading={loading} variant="primary">
  {isEdit ? "Save Changes" : "Create Task"}
</Button>

// Cancel button
<Button type="button" onClick={onCancel} disabled={loading} variant="secondary">
  Cancel
</Button>
```

### Modals

```tsx
// Confirmation modal
<Button onClick={onClose} variant="secondary">
  Cancel
</Button>
<Button onClick={handleConfirm} variant="danger">
  Delete
</Button>

// Alert modal
<Button onClick={onClose} variant="primary">
  OK
</Button>
```

### Navigation

```tsx
// Previous/Next buttons
<Button
  onClick={handlePrevious}
  disabled={currentIndex === 0}
  variant="secondary"
  icon={<ChevronLeft size={18} />}
  iconPosition="left"
>
  Previous
</Button>

<Button
  onClick={handleNext}
  variant="primary"
  icon={<ChevronRight size={18} />}
  iconPosition="right"
>
  Next
</Button>
```

### Actions with Icons

```tsx
// Upload button
<Button
  onClick={handleUpload}
  isLoading={uploading}
  variant="primary"
  icon={<Upload size={18} />}
  iconPosition="left"
>
  Upload Photo
</Button>

// Create button
<Button
  onClick={handleCreate}
  variant="primary"
  icon={<Plus size={18} />}
>
  New Task
</Button>
```

### Authentication

```tsx
// Login
<Button type="submit" isLoading={loading} variant="primary" fullWidth>
  Sign in
</Button>

// Forgot password (ghost style)
<Button type="button" onClick={showForgotPassword} variant="ghost" size="sm">
  Forgot your password?
</Button>

// Logout
<Button onClick={handleLogout} isLoading={loading} variant="danger">
  Logout
</Button>
```

## Components Using Button

### ✅ Fully Migrated Components

| Component | Location | Button Usage |
|-----------|----------|--------------|
| DeleteConfirmModal | `/components/ui/delete-confirm-modal.tsx` | Cancel (secondary), Delete (danger) |
| AlertModal | `/components/ui/alert-modal.tsx` | OK button with dynamic variant |
| TaskForm | `/components/tasks/task-form.tsx` | Cancel, Submit with loading |
| FlashcardForm | `/components/flashcards/flashcard-form.tsx` | Cancel, Submit with loading |
| LogoutButton | `/components/logout-button.tsx` | Logout with loading |
| StudySession | `/components/flashcards/study-session.tsx` | Navigation, Finish |
| LoginPage | `/app/(auth)/login/page.tsx` | Submit, forgot password, reset |
| SignUpPage | `/app/(auth)/signup/page.tsx` | Submit with loading |
| SettingsPage | `/app/(dashboard)/settings/page.tsx` | Upload, Update password |

### ⚠️ Components with Custom Buttons (Intentionally Not Migrated)

These components have specialized button patterns that should remain as-is:

| Component | Location | Why Not Migrated |
|-----------|----------|------------------|
| EditorToolbar | `/components/editor/toolbar.tsx` | Icon-only toolbar buttons with active states |
| StudySession (ratings) | `/components/flashcards/study-session.tsx` | Color-coded rating buttons (red/yellow/green/blue) |
| StudySession (indicators) | `/components/flashcards/study-session.tsx` | Card indicators with colored borders |
| ThemeToggle | `/components/theme-toggle.tsx` | Custom icon button with theme-specific styling |
| CommandPalette | `/components/search/command-palette.tsx` | Custom menu item buttons |
| KnowledgeGraph | `/components/notes/knowledge-graph.tsx` | Graph node buttons |
| TagBadge | `/components/tags/tag-badge.tsx` | Inline X buttons for tag removal |
| DashboardNav | `/components/dashboard-nav.tsx` | Navigation menu items |
| AvatarDropdown | `/components/avatar-dropdown.tsx` | Dropdown menu items |

## Migration Guide

### Before (Old Pattern)

```tsx
<button
  onClick={handleSubmit}
  disabled={loading}
  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? "Submitting..." : "Submit"}
</button>
```

### After (Using Button Component)

```tsx
<Button
  onClick={handleSubmit}
  isLoading={loading}
  variant="primary"
>
  Submit
</Button>
```

### Benefits

1. **Less Code**: ~4 lines instead of 8+ lines
2. **Consistency**: Automatic styling matches design system
3. **Accessibility**: Built-in disabled states and focus management
4. **Maintainability**: Single source of truth for button styles
5. **Loading States**: Automatic spinner and text handling

## Styling Customization

### CSS Variables Used

The Button component integrates with your theme system:

```css
--primary: Primary action color
--secondary: Secondary action color
--surface: Button background (secondary variant)
--surface-secondary: Alternative surface
--surface-hover: Hover state background
--border: Border color
--text-primary: Primary text color
--text-secondary: Secondary text color
```

### Custom Classes

You can add custom classes that will be merged with component styles:

```tsx
<Button variant="primary" className="mt-4 shadow-lg">
  Custom Styled Button
</Button>
```

## Best Practices

### DO ✅

- Use `variant="primary"` for main CTAs
- Use `variant="secondary"` for cancel/alternative actions
- Use `variant="danger"` for destructive actions
- Use `isLoading` prop for async operations
- Use icons for clarity (upload, add, navigate)
- Use `fullWidth` for mobile-responsive forms
- Use `size="sm"` for inline or compact UIs

### DON'T ❌

- Don't use `<button>` tags directly for standard actions
- Don't manually handle loading states with conditional text
- Don't create one-off button variants
- Don't use the Button component for highly specialized UI elements (toolbars, graph nodes, etc.)
- Don't add time-based animations beyond duration-300

## Testing

### Component Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('shows loading spinner when isLoading is true', () => {
  render(<Button isLoading>Submit</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Future Enhancements

Potential improvements for the Button component:

- [ ] Add `compact` variant for denser UIs
- [ ] Add `outline` variant option
- [ ] Add tooltip support
- [ ] Add keyboard shortcut hints
- [ ] Add analytics event tracking
- [ ] Add haptic feedback for mobile

## Support

For issues or questions about the Button component:

1. Check this documentation
2. Review existing usage in migrated components
3. Test in Storybook (if available)
4. Create an issue in the repository

---

**Last Updated:** 2025-12-25
**Component Version:** 1.0.0
**Maintained by:** Study Buddy Development Team
