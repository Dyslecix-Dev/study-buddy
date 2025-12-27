# Migration Guide: From Fuse.js to Advanced Search

This guide helps you migrate from the existing Fuse.js search to the new Typesense-powered Advanced Search.

## Migration Strategy

You have two options:

1. **Gradual Migration** (Recommended) - Run both systems in parallel
2. **Direct Migration** - Replace immediately

---

## Option 1: Gradual Migration (Recommended)

### Step 1: Set Up Typesense

Follow the [Quick Setup Guide](./SEARCH_SETUP_GUIDE.md) to:
- Install and configure Typesense
- Initialize collections
- Index existing content

### Step 2: Update Your Layout

Replace the old `CommandPalette` with feature-flagged version:

```tsx
// app/layout.tsx or wherever you have CommandPalette
import CommandPalette from "@/components/search/command-palette";
import AdvancedCommandPalette from "@/components/search/advanced-command-palette";

// Add feature flag (can use env variable or database setting)
const USE_ADVANCED_SEARCH = process.env.NEXT_PUBLIC_USE_ADVANCED_SEARCH === "true";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {USE_ADVANCED_SEARCH ? (
          <AdvancedCommandPalette />
        ) : (
          <CommandPalette />
        )}
        {children}
      </body>
    </html>
  );
}
```

### Step 3: Add Environment Variable

```bash
# .env
NEXT_PUBLIC_USE_ADVANCED_SEARCH="true"
```

### Step 4: Fetch Additional Data for Filters

The advanced search needs tags, folders, and decks for the filter UI:

```tsx
// app/layout.tsx or a wrapper component
"use client";

import { useState, useEffect } from "react";
import AdvancedCommandPalette from "@/components/search/advanced-command-palette";

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [tags, setTags] = useState([]);
  const [folders, setFolders] = useState([]);
  const [decks, setDecks] = useState([]);

  useEffect(() => {
    async function fetchFilterData() {
      try {
        // Fetch tags
        const tagsRes = await fetch("/api/tags");
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData.tags || []);
        }

        // Fetch folders
        const foldersRes = await fetch("/api/folders");
        if (foldersRes.ok) {
          const foldersData = await foldersRes.json();
          setFolders(foldersData.folders || []);
        }

        // Fetch decks
        const decksRes = await fetch("/api/decks");
        if (decksRes.ok) {
          const decksData = await decksRes.json();
          setDecks(decksData.decks || []);
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    }

    fetchFilterData();
  }, []);

  return (
    <>
      <AdvancedCommandPalette
        availableTags={tags}
        availableFolders={folders}
        availableDecks={decks}
      />
      {children}
    </>
  );
}
```

### Step 5: Test Both Systems

- Toggle `NEXT_PUBLIC_USE_ADVANCED_SEARCH` between true/false
- Compare search results
- Ensure both work correctly
- Gather user feedback

### Step 6: Monitor Usage

Add analytics to track which system is being used:

```typescript
// Track usage
if (USE_ADVANCED_SEARCH) {
  analytics.track("search_advanced", { query, filters });
} else {
  analytics.track("search_legacy", { query });
}
```

### Step 7: Full Switch

Once confident:
1. Set `NEXT_PUBLIC_USE_ADVANCED_SEARCH="true"` permanently
2. Remove the feature flag logic
3. Remove old `CommandPalette` component
4. Uninstall Fuse.js: `npm uninstall fuse.js`

---

## Option 2: Direct Migration

### Step 1: Complete Setup

Follow the [Quick Setup Guide](./SEARCH_SETUP_GUIDE.md) completely.

### Step 2: Replace Component Globally

Find all usages of the old CommandPalette:

```bash
# Search for old component
grep -r "CommandPalette" --include="*.tsx" --include="*.ts" app/
```

Replace with:

```tsx
// Before
import CommandPalette from "@/components/search/command-palette";

// After
import AdvancedCommandPalette from "@/components/search/advanced-command-palette";
```

### Step 3: Update Component Usage

Update props if needed:

```tsx
// Old (no props needed)
<CommandPalette />

// New (with filter data)
<AdvancedCommandPalette
  availableTags={tags}
  availableFolders={folders}
  availableDecks={decks}
/>
```

### Step 4: Remove Old Files

```bash
# Backup first!
git commit -am "Backup before removing old search"

# Remove old component
rm components/search/command-palette.tsx

# Keep search-trigger.tsx (still works with new search)
```

### Step 5: Update API Route (Optional)

The old `/api/search` route fetches all data client-side. You can:

**Option A:** Keep it for backward compatibility
**Option B:** Update it to return filter data only

```typescript
// app/api/search/route.ts - Updated version
export async function GET(request: NextRequest) {
  // ... auth ...

  // Return only filter data
  const [folders, tags, decks] = await Promise.all([
    prisma.folder.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
    }),
    prisma.tag.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, color: true },
    }),
    prisma.deck.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
    }),
  ]);

  return NextResponse.json({ folders, tags, decks });
}
```

### Step 6: Remove Fuse.js

```bash
npm uninstall fuse.js
```

---

## Auto-Indexing Integration

To keep search results fresh, auto-index content when it changes.

### Method 1: Direct Integration

Update your API routes:

```typescript
// app/api/notes/route.ts
import { indexNote } from "@/lib/search-indexing";

export async function POST(request: NextRequest) {
  // ... create note ...

  const note = await prisma.note.create({ data });

  // Index in search
  try {
    await indexNote(note.id, user.id);
  } catch (error) {
    console.error("Failed to index note:", error);
    // Don't fail the request if indexing fails
  }

  return NextResponse.json({ note });
}

export async function PUT(request: NextRequest) {
  // ... update note ...

  const note = await prisma.note.update({ where, data });

  // Reindex
  try {
    await indexNote(note.id, user.id);
  } catch (error) {
    console.error("Failed to reindex note:", error);
  }

  return NextResponse.json({ note });
}

export async function DELETE(request: NextRequest) {
  // ... delete note ...

  await prisma.note.delete({ where });

  // Remove from index
  try {
    await deleteFromIndex("notes", noteId);
  } catch (error) {
    console.error("Failed to delete from index:", error);
  }

  return NextResponse.json({ success: true });
}
```

Repeat for:
- Tasks (`app/api/tasks/route.ts`)
- Flashcards (`app/api/flashcards/route.ts`)
- Folders (`app/api/folders/route.ts`)
- Tags (`app/api/tags/route.ts`)

### Method 2: Prisma Middleware (Advanced)

Create a middleware to auto-index:

```typescript
// lib/prisma-search-middleware.ts
import { Prisma } from "@prisma/client";
import { indexNote, indexTask, indexFlashcard, indexFolder, indexTag, deleteFromIndex } from "./search-indexing";

export function setupSearchMiddleware(prisma: PrismaClient) {
  prisma.$use(async (params, next) => {
    const result = await next(params);

    // Only handle create, update, delete
    if (!["create", "update", "delete"].includes(params.action)) {
      return result;
    }

    try {
      const userId = result?.userId || params.args?.data?.userId;

      switch (params.model) {
        case "Note":
          if (params.action === "delete") {
            await deleteFromIndex("notes", params.args.where.id);
          } else {
            await indexNote(result.id, userId);
          }
          break;

        case "Task":
          if (params.action === "delete") {
            await deleteFromIndex("tasks", params.args.where.id);
          } else {
            await indexTask(result.id, userId);
          }
          break;

        case "Flashcard":
          if (params.action === "delete") {
            await deleteFromIndex("flashcards", params.args.where.id);
          } else {
            // Need to get userId from deck
            const flashcard = await prisma.flashcard.findUnique({
              where: { id: result.id },
              include: { Deck: { select: { userId: true } } },
            });
            if (flashcard) {
              await indexFlashcard(result.id, flashcard.Deck.userId);
            }
          }
          break;

        case "Folder":
          if (params.action === "delete") {
            await deleteFromIndex("folders", params.args.where.id);
          } else {
            await indexFolder(result.id, userId);
          }
          break;

        case "Tag":
          if (params.action === "delete") {
            await deleteFromIndex("tags", params.args.where.id);
          } else {
            await indexTag(result.id, userId);
          }
          break;
      }
    } catch (error) {
      console.error("Search indexing error:", error);
      // Don't fail the database operation if indexing fails
    }

    return result;
  });
}
```

Then in `lib/prisma.ts`:

```typescript
import { setupSearchMiddleware } from "./prisma-search-middleware";

// ... existing prisma client setup ...

if (process.env.NODE_ENV !== "production") {
  setupSearchMiddleware(prisma);
}

export { prisma };
```

---

## Rollback Plan

If you need to rollback:

### Quick Rollback (Gradual Migration)

```bash
# Set environment variable back
NEXT_PUBLIC_USE_ADVANCED_SEARCH="false"

# Restart app
npm run dev
```

### Full Rollback (Direct Migration)

```bash
# Restore from git
git checkout HEAD~1 components/search/command-palette.tsx

# Reinstall Fuse.js
npm install fuse.js

# Update imports
# Change AdvancedCommandPalette back to CommandPalette

# Restart
npm run dev
```

---

## Data Migration Checklist

- [ ] Typesense installed and running
- [ ] Environment variables configured
- [ ] Collections initialized
- [ ] All existing content indexed
- [ ] Search works with basic queries
- [ ] Filters work correctly
- [ ] Search history saving
- [ ] Component integrated in app
- [ ] Old search backed up
- [ ] Team trained on new syntax
- [ ] Documentation reviewed
- [ ] Rollback plan tested

---

## Testing Checklist

Before going live, test:

- [ ] Basic text search
- [ ] Search with `type:` filter
- [ ] Search with `tag:` filter
- [ ] Task due date filters
- [ ] Task priority filters
- [ ] Task completion filters
- [ ] Note folder filters
- [ ] Flashcard deck filters
- [ ] Combined filters
- [ ] Search history
- [ ] Empty search (shows history)
- [ ] No results handling
- [ ] Result highlighting
- [ ] Keyboard shortcuts (Cmd+K)
- [ ] Mobile responsiveness
- [ ] Performance (search speed)
- [ ] Auto-indexing (if implemented)

---

## Performance Tuning

### Optimize Search Speed

```typescript
// In lib/advanced-search.ts

// Reduce per_page if results are slow
const searchParams: SearchParams = {
  // ...
  per_page: 10, // Instead of 20
};

// Add timeout
const searchParams: SearchParams = {
  // ...
  timeout: 3000, // 3 seconds max
};
```

### Cache Frequent Searches

```typescript
// In app/api/search/advanced/route.ts
import { cache } from "react";

const getCachedResults = cache(async (query: string, userId: string) => {
  return await advancedSearch(query, userId);
});
```

### Lazy Load Filter Data

```typescript
// Don't fetch all tags/folders/decks upfront
// Fetch only when filter panel opens

const [filterData, setFilterData] = useState(null);
const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);

useEffect(() => {
  if (filtersPanelOpen && !filterData) {
    fetchFilterData();
  }
}, [filtersPanelOpen]);
```

---

## Common Migration Issues

### Issue: "Collection not found"

**Cause:** Collections not initialized

**Fix:**
```bash
curl -X POST http://localhost:3000/api/search/init
```

### Issue: "No results found" for existing content

**Cause:** Content not indexed

**Fix:**
```bash
curl -X PUT http://localhost:3000/api/search/index
```

### Issue: Slow search performance

**Cause:** Network latency to Typesense server

**Fix:**
- Use Typesense Cloud closer to your region
- Reduce `per_page` limit
- Add caching layer

### Issue: Search history not saving

**Cause:** Database migration not run

**Fix:**
```bash
npx prisma migrate dev --name add_search_history
# or
npx prisma db push
```

### Issue: Filter data not loading

**Cause:** Missing API routes or incorrect fetch URLs

**Fix:**
Check that these endpoints exist and return data:
- `/api/tags`
- `/api/folders`
- `/api/decks`

---

## Post-Migration Tasks

1. **Monitor Performance**
   - Track search latency
   - Monitor Typesense operation count
   - Watch for errors in logs

2. **Gather Feedback**
   - Ask users about search quality
   - Track zero-result searches
   - Identify missing features

3. **Optimize**
   - Tune relevance scoring
   - Add more filters based on usage
   - Implement auto-complete

4. **Document**
   - Update user guides
   - Create search tips in UI
   - Train support team

5. **Clean Up**
   - Remove old code
   - Uninstall Fuse.js
   - Archive old documentation

---

## Support

If you encounter issues during migration:

1. Check the [ADVANCED_SEARCH.md](./ADVANCED_SEARCH.md) documentation
2. Review [SEARCH_SETUP_GUIDE.md](./SEARCH_SETUP_GUIDE.md)
3. Check Typesense logs
4. Verify environment variables
5. Test API endpoints directly with curl
6. Create a GitHub issue with details

---

**Migration Last Updated:** December 26, 2024

Good luck with your migration! The advanced search will significantly improve your users' experience.
