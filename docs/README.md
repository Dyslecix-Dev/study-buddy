# Developer Documentation

> **Note:** This is the **developer documentation** for contributors. For the project overview and features, see the [main README](../README.md) in the root directory.

Welcome! This guide will help you navigate the codebase and implement new features.

## 📚 Documentation Index

### For New Developers
1. **[Getting Started](#getting-started)** - Setup and project overview
2. **[Architecture Overview](#architecture-overview)** - How the codebase is organized
3. **[Common Tasks](#common-tasks)** - Quick guides for common operations

### Feature Guides
- **[Gamification System](./features/GAMIFICATION.md)** - XP, levels, achievements, badges
- **[Advanced Search](./features/SEARCH.md)** - Typesense integration and filters
- **[Note Linking](./features/NOTE_LINKING.md)** - Wiki-style note connections
- **[Sharing System](./features/SHARING.md)** - Collaborative content sharing
- **[Spaced Repetition](./features/SPACED_REPETITION.md)** - Flashcard review algorithm

### Component Guides
- **[UI Components](./components/UI_COMPONENTS.md)** - Button, badges, color system
- **[Testing Guide](./TESTING_QUICKSTART.md)** - Unit & E2E testing

### Operations
- **[Deployment](./DEPLOYMENT.md)** - Production deployment guide
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and fixes

---

## Getting Started

### Prerequisites
- Node.js 20+ (or 22+)
- PostgreSQL database (via Supabase)
- Docker (optional, for Typesense)

### Quick Setup

1. **Clone and install:**
   ```bash
   git clone <repo>
   cd study-buddy
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Fill in your credentials
   ```

3. **Setup database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Access app:**
   ```
   http://localhost:3000
   ```

### Environment Variables Required

**Database (Required):**
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection

**Supabase Auth (Required):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Optional Features:**
- `TYPESENSE_HOST/PORT/API_KEY` - For advanced search
- `RESEND_API_KEY` - For email notifications
- `BLOB_READ_WRITE_TOKEN` - For file uploads

See [.env.example](../.env.example) for complete list.

---

## Architecture Overview

### Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Custom CSS variables
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Search:** Typesense (optional)
- **State:** Zustand + TanStack Query
- **Testing:** Vitest, Cypress

### Project Structure

```
study-buddy/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Main app routes
│   │   ├── notes/
│   │   ├── tasks/
│   │   ├── flashcards/
│   │   ├── calendar/
│   │   └── ...
│   ├── api/               # API routes
│   │   ├── notes/
│   │   ├── tasks/
│   │   ├── search/
│   │   └── ...
│   └── generated/         # Prisma generated client
├── components/            # React components
│   ├── notes/
│   ├── tasks/
│   ├── flashcards/
│   ├── gamification/
│   ├── search/
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Database client
│   ├── supabase/         # Auth client
│   ├── gamification.ts   # XP & achievements
│   ├── typesense.ts      # Search client
│   └── ...
├── prisma/               # Database schema
│   └── schema.prisma
├── docs/                 # Documentation (you are here!)
├── tests/                # Test files
└── public/               # Static assets
```

### Database Models (Key Ones)

- **User** - User accounts and profiles
- **Note** - Rich text notes with Tiptap JSON
- **Task** - Todo items with due dates & priorities
- **Flashcard** - Spaced repetition flashcards
- **Deck** - Flashcard collections
- **Folder** - Note organization
- **Tag** - Cross-content tagging
- **UserProgress** - Gamification data (XP, level)
- **Achievement** - Achievement definitions
- **UserAchievement** - Unlocked achievements
- **SearchHistory** - Search queries tracking
- **ShareRequest** - Content sharing

See [prisma/schema.prisma](../prisma/schema.prisma) for complete schema.

---

## Common Tasks

### Adding a New Feature

1. **Plan the feature:**
   - Define database models needed
   - Sketch UI components
   - Identify API endpoints required

2. **Update database schema:**
   ```bash
   # Edit prisma/schema.prisma
   npx prisma db push
   npx prisma generate
   ```

3. **Create API routes:**
   ```typescript
   // app/api/your-feature/route.ts
   export async function GET(request: NextRequest) {
     // Handle GET request
   }
   ```

4. **Build components:**
   ```typescript
   // components/your-feature/component.tsx
   "use client";

   export default function YourComponent() {
     // Component code
   }
   ```

5. **Add to navigation:**
   ```typescript
   // Update components/dashboard-nav.tsx
   ```

6. **Test:**
   ```bash
   npm run test
   npm run cypress
   ```

### Creating a New API Endpoint

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get query params
    const searchParams = request.nextUrl.searchParams;
    const param = searchParams.get("param");

    // 3. Query database
    const data = await prisma.yourModel.findMany({
      where: { userId: user.id },
    });

    // 4. Return response
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Adding to the Gamification System

```typescript
import { checkAndAwardAchievements } from "@/lib/gamification-service";
import { logActivity } from "@/lib/activity-logger";

// After creating a note
const note = await prisma.note.create({ data });

// 1. Log the activity
await logActivity({
  userId: user.id,
  type: "note_created",
  entityType: "note",
  entityId: note.id,
  title: note.title,
});

// 2. Award XP and check achievements
await checkAndAwardAchievements(user.id, "note_created", {
  noteId: note.id,
});
```

### Indexing Content for Search

```typescript
import { indexNote } from "@/lib/search-indexing";

// After creating/updating content
const note = await prisma.note.create({ data });

// Index for search (async, won't fail the request)
try {
  await indexNote(note.id, user.id);
} catch (error) {
  console.error("Failed to index:", error);
}
```

### Adding a Custom Theme Color

```css
/* app/globals.css */

:root {
  --your-color: #hexcode;
}

[data-theme="dark"] {
  --your-color: #dark-hexcode;
}
```

Then use in components:
```tsx
<div style={{ color: "var(--your-color)" }}>
  Content
</div>
```

---

## Development Workflow

### Daily Development

```bash
# Start dev server
npm run dev

# Run tests in watch mode
npm run test:watch

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Before Committing

```bash
# Run all tests
npm run test:run

# Run E2E tests
npm run e2e:headless

# Check build
npm run build
```

### Database Changes

```bash
# After editing schema.prisma
npx prisma db push          # Push changes to database
npx prisma generate         # Regenerate Prisma client
npx prisma studio          # Open database GUI
```

### Adding Dependencies

```bash
# Add package
npm install package-name

# Add dev dependency
npm install -D package-name

# Update package.json and package-lock.json
```

---

## Key Patterns & Conventions

### API Route Pattern

All API routes follow this structure:
1. Authenticate user with Supabase
2. Validate input (query params or body)
3. Authorize access (user owns the resource)
4. Perform database operation
5. Return JSON response
6. Handle errors with try-catch

### Component Pattern

```typescript
"use client"; // Only if using hooks/state

import { useState, useEffect } from "react";

interface Props {
  // Define props
}

export default function Component({ ...props }: Props) {
  // 1. State
  const [state, setState] = useState();

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 3. Handlers
  const handleAction = () => {
    // Handler logic
  };

  // 4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Database Query Pattern

```typescript
// Always filter by userId for security
const data = await prisma.model.findMany({
  where: {
    userId: user.id,
    // other filters
  },
  include: {
    // related data
  },
  orderBy: {
    createdAt: "desc",
  },
});
```

### Error Handling

```typescript
try {
  // Operation
} catch (error) {
  console.error("Descriptive error message:", error);

  // In API routes
  return NextResponse.json(
    { error: "User-friendly message" },
    { status: 500 }
  );

  // In components
  toast.error("User-friendly message");
}
```

---

## Testing

### Unit Tests (Vitest)

```typescript
// tests/example.test.ts
import { describe, it, expect } from "vitest";

describe("Feature", () => {
  it("should do something", () => {
    const result = yourFunction();
    expect(result).toBe(expected);
  });
});
```

Run: `npm run test`

### E2E Tests (Cypress)

```typescript
// cypress/e2e/example.cy.ts
describe("Feature E2E", () => {
  it("should complete workflow", () => {
    cy.visit("/");
    cy.get("[data-testid='button']").click();
    cy.url().should("include", "/expected");
  });
});
```

Run: `npm run cypress` or `npm run e2e:headless`

See [TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md) for details.

---

## Deployment

1. **Environment variables:** Set all required env vars in hosting platform
2. **Build command:** `npm run build`
3. **Start command:** `npm start`
4. **Database:** Run migrations on production DB
5. **Monitoring:** Enable error tracking (Sentry recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide.

---

## Need Help?

### Documentation by Feature

| Feature | Documentation |
|---------|--------------|
| Gamification | [features/GAMIFICATION.md](./features/GAMIFICATION.md) |
| Search | [features/SEARCH.md](./features/SEARCH.md) |
| Note Linking | [features/NOTE_LINKING.md](./features/NOTE_LINKING.md) |
| Sharing | [features/SHARING.md](./features/SHARING.md) |
| Spaced Repetition | [features/SPACED_REPETITION.md](./features/SPACED_REPETITION.md) |
| UI Components | [components/UI_COMPONENTS.md](./components/UI_COMPONENTS.md) |

### Common Issues

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for:
- Build errors
- Database connection issues
- Auth problems
- Search not working
- Test failures

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Typesense Documentation](https://typesense.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Update documentation
4. Submit pull request
5. Pass CI/CD checks

---

**Last Updated:** December 2024

**Questions?** Check the feature-specific documentation or create an issue on GitHub.
