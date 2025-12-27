# Search

Fuse.js client-side fuzzy search (free, no external service).

## How It Works

User query → Parse filters → DB query → Fuse.js fuzzy search → Return with highlights

## Syntax

- `type:note/task/flashcard/folder/tag`
- `tag:math`
- `due:today/tomorrow/week/overdue`
- `completed:true/false`
- `priority:0/1/2`

Example: `homework type:task tag:math due:today priority:2`

## Files

- `lib/fuse-search.ts`
- `app/api/search/advanced/route.ts`
- `components/search/advanced-command-palette.tsx`

## Advantages

✅ Free ✅ No external service ✅ Simple ✅ Privacy (server-side)

## Limitations

⚠️ Best for <10k items/user ⚠️ In-memory (100 results/type limit)

## Performance

If slow: Reduce limits in `lib/fuse-search.ts`, add DB indexes, implement pagination

## Scaling

For 10k+ items: Algolia, PostgreSQL FTS, or Meilisearch
