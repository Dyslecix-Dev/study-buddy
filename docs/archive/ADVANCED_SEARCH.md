# Advanced Search with Filters - Implementation Guide

This document provides a comprehensive guide for the Advanced Search feature implemented as part of Phase 4 (Section 4.4) of the roadmap.

## Overview

The Advanced Search system replaces the basic Fuse.js implementation with Typesense, providing:

- **Full-text search** across all content types
- **Advanced filters** by type, tags, dates, status, and more
- **Search syntax** support (e.g., `tag:math type:note due:today`)
- **Search history** tracking
- **Relevance scoring** and highlighting
- **Better performance** at scale

## Table of Contents

1. [Setup](#setup)
2. [Architecture](#architecture)
3. [Search Syntax](#search-syntax)
4. [API Endpoints](#api-endpoints)
5. [Components](#components)
6. [Indexing](#indexing)
7. [Usage Examples](#usage-examples)
8. [Testing](#testing)

---

## Setup

### 1. Typesense Configuration

#### Option A: Typesense Cloud (Recommended for Production)

1. Sign up at https://cloud.typesense.org/
2. Create a new cluster (free tier available)
3. Get your API credentials
4. Add to `.env`:

```bash
TYPESENSE_HOST="xxx-1.a1.typesense.net"
TYPESENSE_PORT="443"
TYPESENSE_PROTOCOL="https"
TYPESENSE_API_KEY="your_api_key_here"
```

#### Option B: Local Development with Docker

```bash
docker run -d \
  -p 8108:8108 \
  -v /tmp/typesense-data:/data \
  typesense/typesense:27.1 \
  --data-dir /data \
  --api-key=xyz
```

Then in `.env`:

```bash
TYPESENSE_HOST="localhost"
TYPESENSE_PORT="8108"
TYPESENSE_PROTOCOL="http"
TYPESENSE_API_KEY="xyz"
```

### 2. Initialize Collections

After setting up Typesense, initialize the search collections:

```bash
# Via API endpoint
curl -X POST http://localhost:3000/api/search/init

# Or programmatically
import { initializeCollections } from '@/lib/typesense';
await initializeCollections();
```

### 3. Index Existing Content

To index all existing content for a user:

```bash
# Via API endpoint
curl -X PUT http://localhost:3000/api/search/index

# Or programmatically
import { indexAllUserContent } from '@/lib/search-indexing';
await indexAllUserContent(userId);
```

---

## Architecture

### File Structure

```
lib/
├── typesense.ts              # Typesense client & schema definitions
├── search-indexing.ts        # Indexing functions for all content types
└── advanced-search.ts        # Search logic with filters & syntax parsing

app/api/search/
├── route.ts                  # Legacy search endpoint (keep for backward compatibility)
├── advanced/route.ts         # New advanced search endpoint
├── index/route.ts           # Indexing operations (POST, DELETE, PUT)
├── init/route.ts            # Initialize collections
└── history/route.ts         # Search history (GET, POST, DELETE)

components/search/
├── command-palette.tsx           # Legacy command palette (Fuse.js)
├── advanced-command-palette.tsx  # New advanced command palette (Typesense)
├── search-filters.tsx           # Filter UI component
└── search-trigger.tsx           # Search trigger button
```

### Data Flow

```
User Input → Advanced Command Palette → API Endpoint → Typesense → Results → UI
                     ↓
              Search History DB
```

### Collections Schema

#### Notes Collection
- `id`, `userId`, `title`, `content`
- `folderId`, `folderName`
- `tags[]`, `tagIds[]`
- `createdAt`, `updatedAt`

#### Tasks Collection
- `id`, `userId`, `title`, `description`
- `completed`, `priority`, `dueDate`
- `tags[]`, `tagIds[]`
- `createdAt`, `updatedAt`

#### Flashcards Collection
- `id`, `userId`, `front`, `back`
- `deckId`, `deckName`
- `tags[]`, `tagIds[]`
- `nextReview`, `createdAt`, `updatedAt`

#### Folders Collection
- `id`, `userId`, `name`, `description`
- `color`, `createdAt`, `updatedAt`

#### Tags Collection
- `id`, `userId`, `name`, `color`
- `usageCount`, `createdAt`

---

## Search Syntax

### Basic Search

```
calculus notes
```

### Type Filters

```
type:note        # Search only notes
type:task        # Search only tasks
type:flashcard   # Search only flashcards
type:folder      # Search only folders
type:tag         # Search only tags
```

### Tag Filters

```
tag:math                    # Items tagged with 'math'
tag:math tag:algebra        # Items with both tags
calculus tag:math           # Search 'calculus' in items tagged 'math'
```

### Task-Specific Filters

```
due:today              # Tasks due today
due:tomorrow           # Tasks due tomorrow
due:week              # Tasks due within next 7 days
due:overdue           # Overdue tasks

completed:true        # Completed tasks
completed:false       # Active tasks

priority:0            # No priority
priority:1            # Low priority
priority:2            # Medium priority
priority:3            # High priority
```

### Combined Queries

```
type:task tag:homework due:today completed:false
# Find incomplete homework tasks due today

calculus tag:math type:note
# Find notes about calculus tagged with math

type:flashcard tag:biology tag:cells
# Find flashcards tagged with both biology and cells
```

---

## API Endpoints

### `GET /api/search/advanced`

Perform an advanced search with filters.

**Query Parameters:**
- `q` - Search query string
- `type` - Content type filter
- `tags` - Comma-separated tag names
- `completed` - Boolean for task completion
- `priority` - Task priority (0-3)
- `folderId` - Filter notes by folder
- `deckId` - Filter flashcards by deck
- `dueDateFrom` - ISO date string
- `dueDateTo` - ISO date string
- `createdFrom` - ISO date string
- `createdTo` - ISO date string

**Example:**
```bash
GET /api/search/advanced?q=calculus&type=note&tags=math
```

**Response:**
```json
{
  "query": "calculus",
  "filters": { "type": "note", "tags": ["math"] },
  "results": [
    {
      "type": "note",
      "id": "...",
      "title": "Calculus Fundamentals",
      "content": "...",
      "url": "/notes/...",
      "tags": ["math", "calculus"],
      "highlight": {
        "title": "<mark>Calculus</mark> Fundamentals",
        "content": "Introduction to <mark>calculus</mark>..."
      }
    }
  ],
  "count": 1
}
```

### `POST /api/search/index`

Index a specific document.

**Body:**
```json
{
  "type": "note",
  "id": "note-id-here"
}
```

### `DELETE /api/search/index`

Remove a document from the index.

**Query Parameters:**
- `type` - Document type
- `id` - Document ID

### `PUT /api/search/index`

Reindex all content for the current user.

### `POST /api/search/init`

Initialize Typesense collections (run once).

### `GET /api/search/history`

Get user's search history.

**Query Parameters:**
- `limit` - Number of results (default: 10)

### `POST /api/search/history`

Save a search to history.

**Body:**
```json
{
  "query": "calculus",
  "filters": { "type": "note" },
  "resultCount": 5
}
```

### `DELETE /api/search/history`

Clear search history.

**Query Parameters:**
- `id` - Specific history item ID (optional, clears all if omitted)

---

## Components

### AdvancedCommandPalette

Main search interface with filters and history.

**Usage:**
```tsx
import AdvancedCommandPalette from '@/components/search/advanced-command-palette';

<AdvancedCommandPalette
  availableTags={tags}
  availableFolders={folders}
  availableDecks={decks}
/>
```

**Features:**
- Keyboard shortcut (Cmd+K / Ctrl+K)
- Real-time search with 300ms debounce
- Filter panel with visual controls
- Search history with click-to-reuse
- Syntax highlighting in results
- Search tips at bottom

### SearchFiltersComponent

Reusable filter UI component.

**Usage:**
```tsx
import SearchFiltersComponent from '@/components/search/search-filters';

<SearchFiltersComponent
  filters={filters}
  onFiltersChange={setFilters}
  availableTags={tags}
  availableFolders={folders}
  availableDecks={decks}
/>
```

---

## Indexing

### Automatic Indexing

Ideally, you should automatically index content when it's created or updated:

```typescript
// When creating a note
const note = await prisma.note.create({ data: {...} });
await indexNote(note.id, userId);

// When updating a note
const note = await prisma.note.update({ where: {...}, data: {...} });
await indexNote(note.id, userId);

// When deleting a note
await prisma.note.delete({ where: {...} });
await deleteFromIndex('notes', noteId);
```

### Manual Indexing

```typescript
import {
  indexNote,
  indexTask,
  indexFlashcard,
  indexFolder,
  indexTag,
  deleteFromIndex,
  indexAllUserContent,
} from '@/lib/search-indexing';

// Index a single item
await indexNote(noteId, userId);
await indexTask(taskId, userId);
await indexFlashcard(flashcardId, userId);

// Bulk index all user content
await indexAllUserContent(userId);

// Delete from index
await deleteFromIndex('notes', noteId);
```

### Content Extraction

The indexing functions automatically:
- Extract text from Tiptap JSON content
- Resolve related entities (folders, decks, tags)
- Convert dates to Unix timestamps
- Handle optional fields

---

## Usage Examples

### Example 1: Search Notes by Tag

```typescript
import { advancedSearch } from '@/lib/advanced-search';

const results = await advancedSearch('', userId, {
  type: 'note',
  tags: ['math', 'calculus'],
});
```

### Example 2: Find Overdue Tasks

```typescript
const now = new Date();
const results = await advancedSearch('', userId, {
  type: 'task',
  completed: false,
  dueDateTo: now,
});
```

### Example 3: Search with Natural Syntax

```typescript
const { cleanQuery, filters } = parseSearchQuery(
  'type:task tag:homework due:today completed:false'
);

const results = await advancedSearch(cleanQuery, userId, filters);
```

### Example 4: Search Flashcards in Specific Deck

```typescript
const results = await advancedSearch('mitochondria', userId, {
  type: 'flashcard',
  deckId: biologyDeckId,
});
```

---

## Testing

### Manual Testing

1. **Initialize collections:**
   ```bash
   curl -X POST http://localhost:3000/api/search/init
   ```

2. **Index test content:**
   ```bash
   curl -X PUT http://localhost:3000/api/search/index
   ```

3. **Test basic search:**
   ```bash
   curl "http://localhost:3000/api/search/advanced?q=test"
   ```

4. **Test with filters:**
   ```bash
   curl "http://localhost:3000/api/search/advanced?q=test&type=note&tags=math"
   ```

### Unit Tests

```typescript
import { parseSearchQuery } from '@/lib/advanced-search';

describe('parseSearchQuery', () => {
  it('should extract type filter', () => {
    const { cleanQuery, filters } = parseSearchQuery('type:note calculus');
    expect(filters.type).toBe('note');
    expect(cleanQuery).toBe('calculus');
  });

  it('should extract multiple tags', () => {
    const { filters } = parseSearchQuery('tag:math tag:calculus test');
    expect(filters.tags).toEqual(['math', 'calculus']);
  });

  it('should parse due date filters', () => {
    const { filters } = parseSearchQuery('due:today homework');
    expect(filters.dueDateFrom).toBeDefined();
    expect(filters.dueDateTo).toBeDefined();
  });
});
```

### Integration Tests

```typescript
describe('Advanced Search API', () => {
  it('should return filtered results', async () => {
    const response = await fetch('/api/search/advanced?q=test&type=note');
    const data = await response.json();

    expect(data.results).toBeDefined();
    expect(data.results.every(r => r.type === 'note')).toBe(true);
  });
});
```

---

## Performance Considerations

### Indexing Performance

- Bulk operations use batching
- Indexes are updated asynchronously
- Consider using a queue for high-volume updates

### Search Performance

- Typesense is optimized for sub-50ms searches
- Results are limited to 20 per collection
- Filters use indexed fields for speed

### Scaling

- Free tier: 1M operations/month
- Paid tier starts at $0.03/1000 operations
- Consider caching frequently searched queries

---

## Migration from Fuse.js

### Option 1: Gradual Migration

Keep both systems running:
1. Use feature flag to switch between implementations
2. Index new content in both systems
3. Gradually migrate users
4. Remove Fuse.js when ready

### Option 2: Hard Switch

1. Initialize Typesense collections
2. Bulk index all existing content
3. Replace CommandPalette with AdvancedCommandPalette
4. Remove Fuse.js dependencies

---

## Troubleshooting

### Common Issues

**"Connection refused" error:**
- Check Typesense is running
- Verify TYPESENSE_HOST and TYPESENSE_PORT
- Check firewall settings

**"Collection not found" error:**
- Run initialization: `POST /api/search/init`
- Verify collections exist in Typesense dashboard

**No search results:**
- Check if content is indexed
- Run bulk index: `PUT /api/search/index`
- Verify userId in indexed documents

**Slow search performance:**
- Check network latency to Typesense server
- Consider using Typesense Cloud for better performance
- Reduce result limit if fetching too many results

---

## Future Enhancements

1. **Auto-complete suggestions** - Real-time query suggestions
2. **Faceted search** - Show filter counts (e.g., "Math (15)", "Physics (8)")
3. **Search analytics** - Track popular searches, zero-result queries
4. **Saved searches** - Let users save complex filter combinations
5. **Natural language queries** - "Show me high priority tasks due this week"
6. **Multi-language support** - Search in different languages
7. **Fuzzy matching** - Handle typos and misspellings better
8. **Export results** - Download search results as CSV/PDF

---

## References

- [Typesense Documentation](https://typesense.org/docs/)
- [Typesense Cloud](https://cloud.typesense.org/)
- [Search Syntax Best Practices](https://typesense.org/docs/guide/search-syntax.html)
- [Typesense Pricing](https://cloud.typesense.org/pricing)

---

## Support

For issues or questions:
1. Check this documentation
2. Review Typesense docs
3. Check the GitHub issues
4. Contact support

Last updated: 2024-12-26
