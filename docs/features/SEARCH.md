# Search

Fuse.js-powered search with filters.

## Usage

Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)

## Syntax

```bash
calculus                          # Basic
type:note                         # Type filter
tag:math                          # Tag filter
due:today/tomorrow/week/overdue   # Task due dates
completed:true/false              # Task completion
priority:0/1/2                    # Task priority (Low/Med/High)
calculus type:note tag:math       # Combined
```

## API

**GET** `/api/search/advanced?q=calculus+type:note&tags=math`

Response:
```json
{
  "query": "calculus",
  "filters": { "type": "note", "tags": ["math"] },
  "results": [{ "type": "note", "id": "123", "title": "Calculus I", "url": "/notes/..." }],
  "count": 1
}
```

## Implementation

**Tech:** Fuse.js v7 + Prisma

**Flow:** Parse query → Fetch from DB with filters → Fuse.js fuzzy search → Return with highlights

**Files:**
- `lib/fuse-search.ts`
- `app/api/search/advanced/route.ts`
- `components/search/advanced-command-palette.tsx`

## Performance

Limited to 100 results/type. Best for <10k items/user. In-memory search.

**Optimize:** Add DB indexes, reduce limits, implement pagination

## Examples

```bash
type:note                          # All notes
calculus type:note tag:math        # Math notes about calculus
type:task priority:2 due:today     # High priority tasks due today
homework type:task due:overdue     # Overdue homework
type:flashcard tag:biology         # Biology flashcards
```
