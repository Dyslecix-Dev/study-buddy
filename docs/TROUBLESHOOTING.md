# Troubleshooting Guide

Common issues and solutions for Study Buddy development.

## Table of Contents
- [Build & Development Issues](#build--development-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Search Issues](#search-issues)
- [Gamification Issues](#gamification-issues)
- [Performance Issues](#performance-issues)
- [macOS-Specific Issues](#macos-specific-issues)

---

## Build & Development Issues

### `npm install` fails

**Symptoms:**
- Package installation errors
- Dependency conflicts

**Solutions:**

1. Clear npm cache:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. Check Node.js version:
```bash
node --version  # Should be 20+ or 22+
```

3. Update npm:
```bash
npm install -g npm@latest
```

### `npm run dev` fails to start

**Symptoms:**
- Port already in use
- Build errors

**Solutions:**

1. Kill process on port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

2. Check for errors in console
3. Verify `.env` file exists and has required variables
4. Run Prisma generation:
```bash
npx prisma generate
```

### Build errors with Prisma

**Symptoms:**
- `@prisma/client` not found
- Type errors related to database models

**Solutions:**

```bash
npx prisma generate
npm run dev
```

### TypeScript errors

**Symptoms:**
- Type checking failures
- Import errors

**Solutions:**

1. Restart TypeScript server in VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Check `tsconfig.json` is valid
3. Run type check:
```bash
npx tsc --noEmit
```

---

## Database Issues

### Connection errors

**Symptoms:**
- `Can't reach database server`
- `Connection refused`

**Solutions:**

1. Verify `DATABASE_URL` in `.env`:
```bash
echo $DATABASE_URL
```

2. Check database is running (if local PostgreSQL)
3. Test connection:
```bash
npx prisma db pull
```

### Migration failures

**Symptoms:**
- `Migration failed`
- Schema conflicts

**Solutions:**

1. Reset database (development only):
```bash
npx prisma migrate reset
```

2. Force push schema:
```bash
npx prisma db push --force-reset
```

3. Check for conflicting migrations in `prisma/migrations/`

### Prisma Client errors

**Symptoms:**
- `PrismaClient is not configured`
- Missing models

**Solutions:**

```bash
npx prisma generate
npx prisma db push
```

### Slow queries

**Symptoms:**
- API endpoints timing out
- Database connection pool exhausted

**Solutions:**

1. Add indexes to frequently queried fields
2. Optimize queries (use `select` instead of fetching all fields)
3. Check database performance in hosting dashboard
4. Consider connection pooling with Prisma Accelerate

---

## Authentication Issues

### Can't log in

**Symptoms:**
- Login redirects to error page
- "Unauthorized" errors

**Solutions:**

1. Verify Supabase credentials in `.env`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

2. Check Supabase project is active
3. Verify authentication is enabled in Supabase dashboard
4. Clear cookies and try again

### Session expires immediately

**Symptoms:**
- Logged out after refresh
- Session not persisting

**Solutions:**

1. Check cookie settings
2. Verify `NEXT_PUBLIC_SUPABASE_URL` matches your domain
3. Check browser isn't blocking cookies
4. Verify Supabase Auth settings

### Can't create account

**Symptoms:**
- Signup fails
- Email confirmation not sent

**Solutions:**

1. Check email provider settings in Supabase
2. Verify email templates are configured
3. Check spam folder for confirmation email
4. Enable email confirmation in Supabase Auth settings

---

## Search Issues

### Typesense connection errors

**Symptoms:**
- `Connection refused`
- `ECONNREFUSED`

**Solutions:**

1. Verify Typesense is running:
```bash
docker ps  # Should show typesense container
```

2. Check environment variables:
```bash
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

3. Restart Typesense:
```bash
docker restart typesense
```

### Collections not found

**Symptoms:**
- `Collection notes could not be found`
- Search returns errors

**Solutions:**

```bash
# Initialize collections
curl -X POST http://localhost:3000/api/search/init
```

### No search results

**Symptoms:**
- Search returns empty results
- Content not appearing in search

**Solutions:**

```bash
# Reindex all content
curl -X PUT http://localhost:3000/api/search/index
```

Or for specific content:
```bash
curl -X POST http://localhost:3000/api/search/index \
  -H "Content-Type: application/json" \
  -d '{"type":"note","id":"note-id"}'
```

### Slow searches

**Symptoms:**
- Search takes >1 second
- Timeout errors

**Solutions:**

1. Use Typesense Cloud closer to your region
2. Reduce `per_page` in search queries
3. Check network latency
4. Consider caching frequent searches

---

## Gamification Issues

### Achievements not unlocking

**Symptoms:**
- XP awarded but no achievement
- Modal not showing

**Solutions:**

1. Check achievement is active:
```sql
SELECT * FROM "Achievement" WHERE key = 'achievement-key';
```

2. Verify condition logic in `lib/gamification-service.ts`
3. Check logs for errors during `checkAndAwardAchievements`
4. Manually test:
```typescript
await checkAndAwardAchievements(userId, "note_created", {});
```

### XP not being awarded

**Symptoms:**
- Actions don't give XP
- UserProgress not updating

**Solutions:**

1. Verify `logActivity` is being called
2. Check `DailyProgress` is updating
3. Verify `UserProgress` exists for user:
```sql
SELECT * FROM "UserProgress" WHERE "userId" = 'user-id';
```

4. Create if missing:
```sql
INSERT INTO "UserProgress" ("id", "userId", "level", "currentXP", "totalXP")
VALUES (gen_random_uuid(), 'user-id', 1, 0, 0);
```

### Modals not showing

**Symptoms:**
- Achievement unlocked but no modal
- Modal appears then disappears

**Solutions:**

1. Verify `GamificationModals` component is in layout
2. Check browser console for errors
3. Verify `seen: false` on achievement
4. Test polling:
```bash
curl http://localhost:3000/api/gamification/achievements/unseen
```

---

## Performance Issues

### Slow page loads

**Symptoms:**
- Pages take >3 seconds to load
- API requests timing out

**Solutions:**

1. Check database query performance
2. Add database indexes
3. Optimize API responses (use `select` for specific fields)
4. Enable caching with TanStack Query
5. Use `loading.tsx` for better UX

### Memory leaks

**Symptoms:**
- App slows down over time
- High memory usage

**Solutions:**

1. Check for missing cleanup in `useEffect`:
```typescript
useEffect(() => {
  const interval = setInterval(() => {}, 1000);
  return () => clearInterval(interval); // Cleanup!
}, []);
```

2. Verify event listeners are removed
3. Check for circular dependencies

### Slow builds

**Symptoms:**
- `npm run build` takes >5 minutes
- Out of memory errors

**Solutions:**

1. Increase Node memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

2. Clear `.next` cache:
```bash
rm -rf .next
npm run build
```

---

## macOS-Specific Issues

### File descriptor limits

**Symptoms:**
- `EMFILE: too many open files`
- Build fails

**Solutions:**

Check current limit:
```bash
ulimit -n
```

Increase temporarily:
```bash
ulimit -n 65536
```

Increase permanently:
```bash
# Create/edit file
sudo nano /Library/LaunchDaemons/limit.maxfiles.plist
```

Add:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>65536</string>
      <string>200000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
```

Load:
```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

Verify:
```bash
launchctl limit maxfiles
```

See [FILE_DESCRIPTOR_LIMITS_MACOS.md](./FILE_DESCRIPTOR_LIMITS_MACOS.md) for details.

---

## Testing Issues

### Vitest tests failing

**Symptoms:**
- Random test failures
- Tests timeout

**Solutions:**

1. Run tests serially:
```bash
npm run test -- --no-threads
```

2. Increase timeout:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000, // 10 seconds
  },
});
```

3. Clear test cache:
```bash
npx vitest --clearCache
```

### Cypress tests failing

**Symptoms:**
- E2E tests can't find elements
- Tests timeout

**Solutions:**

1. Increase timeouts in `cypress.config.ts`
2. Use `data-testid` attributes
3. Wait for elements:
```typescript
cy.get('[data-testid="button"]', { timeout: 10000 }).should('be.visible');
```

4. Run in headed mode to debug:
```bash
npm run cypress
```

---

## API Issues

### CORS errors

**Symptoms:**
- `blocked by CORS policy`
- Cross-origin requests fail

**Solutions:**

1. Verify API route allows your origin
2. Check `next.config.ts` headers
3. For local development, ensure you're using `localhost:3000`

### 401 Unauthorized

**Symptoms:**
- API returns 401
- User session issues

**Solutions:**

1. Verify auth token is being sent
2. Check Supabase session is valid
3. Ensure `createClient()` is called correctly
4. Check middleware isn't blocking route

### 500 Internal Server Error

**Symptoms:**
- API crashes
- Generic error response

**Solutions:**

1. Check server logs in terminal
2. Add better error handling:
```typescript
try {
  // API logic
} catch (error) {
  console.error("Detailed error:", error);
  return NextResponse.json({ error: "Specific message" }, { status: 500 });
}
```

3. Check database connection
4. Verify all environment variables are set

---

## General Tips

### Enable verbose logging

```typescript
// Add to API routes
console.log("Request received:", request.method, request.url);
console.log("Body:", await request.json());
console.log("User:", user?.id);
```

### Check browser console

Press `F12` and check:
- Console tab for JavaScript errors
- Network tab for failed requests
- Application tab for localStorage/cookies

### Restart everything

```bash
# Kill all processes
lsof -ti:3000 | xargs kill -9

# Clear caches
rm -rf .next node_modules/.cache

# Restart services
docker restart typesense  # if using
npm run dev
```

### Reset to clean state

```bash
# Backup first!
git status
git stash

# Reset database (dev only!)
npx prisma migrate reset

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npx prisma generate
npm run build
npm run dev
```

---

## Getting More Help

If issues persist:

1. Check the specific feature documentation in `docs/features/`
2. Search GitHub issues
3. Enable debug mode and check logs
4. Create a minimal reproduction
5. Ask in discussions or create an issue

---

**Common Commands Reference:**

```bash
# Development
npm run dev
npm run build
npm run test
npm run cypress

# Database
npx prisma generate
npx prisma db push
npx prisma studio
npx prisma migrate reset

# Search
curl -X POST http://localhost:3000/api/search/init
curl -X PUT http://localhost:3000/api/search/index

# Docker
docker ps
docker restart typesense
docker logs typesense

# Debugging
npx tsc --noEmit
npm run lint
lsof -ti:3000 | xargs kill -9
```

---

**Last Updated:** December 2024
