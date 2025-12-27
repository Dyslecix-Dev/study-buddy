# Quick Start: Advanced Search Setup

This guide will help you set up the Advanced Search feature in 5 minutes.

## Prerequisites

- Study Buddy app running locally or deployed
- Database migrations applied
- User account created

## Step 1: Choose Typesense Setup

### Option A: Docker (Local Development)

```bash
docker run -d \
  --name typesense \
  -p 8108:8108 \
  -v $(pwd)/typesense-data:/data \
  typesense/typesense:27.1 \
  --data-dir /data \
  --api-key=xyz \
  --enable-cors
```

### Option B: Typesense Cloud (Production)

1. Go to https://cloud.typesense.org/
2. Sign up for free tier (1M operations/month)
3. Create a cluster
4. Copy your credentials

## Step 2: Configure Environment Variables

Add to your `.env` file:

```bash
# For Docker (local)
TYPESENSE_HOST="localhost"
TYPESENSE_PORT="8108"
TYPESENSE_PROTOCOL="http"
TYPESENSE_API_KEY="xyz"

# For Typesense Cloud (production)
TYPESENSE_HOST="xxx-1.a1.typesense.net"
TYPESENSE_PORT="443"
TYPESENSE_PROTOCOL="https"
TYPESENSE_API_KEY="your_api_key_here"
```

## Step 3: Run Database Migration

```bash
npx prisma migrate dev --name add_search_history
# OR
npx prisma db push
```

## Step 4: Initialize Search Collections

### Via API (Recommended)

```bash
# Start your Next.js app
npm run dev

# Initialize collections
curl -X POST http://localhost:3000/api/search/init
```

### Via Script (Alternative)

```typescript
// scripts/init-search.ts
import { initializeCollections } from '@/lib/typesense';

async function main() {
  await initializeCollections();
  console.log('Search collections initialized!');
}

main();
```

Run it:
```bash
npx tsx scripts/init-search.ts
```

## Step 5: Index Existing Content

```bash
# This will index all your notes, tasks, flashcards, folders, and tags
curl -X PUT http://localhost:3000/api/search/index
```

You should see output like:
```
Indexed note: My First Note
Indexed note: Calculus Notes
Indexed task: Complete homework
...
```

## Step 6: Test the Search

1. Open your app
2. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
3. Try these searches:

```
type:note math
tag:homework due:today
calculus
completed:false priority:3
```

## Verification Checklist

- [ ] Typesense is running (check `docker ps` or cloud dashboard)
- [ ] Environment variables are set
- [ ] Database migration applied
- [ ] Collections initialized (no errors in API response)
- [ ] Content indexed (check console logs)
- [ ] Search works in UI (Cmd+K opens palette)
- [ ] Filters work (try `type:note`)
- [ ] Search history appears

## Troubleshooting

### "Connection refused" or "ECONNREFUSED"

**Problem:** Can't connect to Typesense server

**Solutions:**
- Check Docker container is running: `docker ps`
- Verify port 8108 is not blocked
- Check TYPESENSE_HOST and TYPESENSE_PORT in .env

### "Collection not found"

**Problem:** Collections haven't been initialized

**Solution:**
```bash
curl -X POST http://localhost:3000/api/search/init
```

### "No results found"

**Problem:** Content not indexed

**Solution:**
```bash
# Reindex all content
curl -X PUT http://localhost:3000/api/search/index
```

### Prisma Client Error

**Problem:** SearchHistory model not found

**Solution:**
```bash
npx prisma generate
npm run dev
```

## Next Steps

1. **Automatic Indexing**: Set up webhooks to auto-index content on create/update
2. **Customize Filters**: Modify `search-filters.tsx` to add more filters
3. **Search Analytics**: Track popular searches in your analytics dashboard
4. **Optimize**: Tune relevance scoring in `lib/advanced-search.ts`

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/search/init` | POST | Initialize collections |
| `/api/search/index` | POST | Index single document |
| `/api/search/index` | PUT | Bulk reindex all content |
| `/api/search/index` | DELETE | Remove from index |
| `/api/search/advanced` | GET | Perform search |
| `/api/search/history` | GET | Get search history |
| `/api/search/history` | POST | Save to history |
| `/api/search/history` | DELETE | Clear history |

## Search Syntax Examples

```bash
# Search by content type
type:note
type:task
type:flashcard

# Search by tag
tag:math
tag:biology tag:cells

# Task filters
due:today
due:tomorrow
due:week
completed:false
priority:3

# Combined
type:task tag:homework due:today completed:false
```

## Resources

- [Full Documentation](./ADVANCED_SEARCH.md)
- [Typesense Docs](https://typesense.org/docs/)
- [Typesense Cloud](https://cloud.typesense.org/)

---

**Estimated Setup Time:** 5-10 minutes

**Need Help?** Check the [full documentation](./ADVANCED_SEARCH.md) or create an issue on GitHub.
