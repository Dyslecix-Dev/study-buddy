# Troubleshooting

## Build & Dev

**npm install fails:** `npm cache clean --force && rm -rf node_modules package-lock.json && npm install`

**Port 3000 in use:** `lsof -ti:3000 | xargs kill -9`

**Prisma errors:** `npx prisma generate && npm run dev`

**TypeScript errors:** Cmd+Shift+P → "TypeScript: Restart TS Server"

## Database

**Connection:** Verify DATABASE_URL in `.env`, run `npx prisma db pull`

**Migrations:** `npx prisma migrate reset` (dev only!) or `npx prisma db push --force-reset`

**Client:** `npx prisma generate && npx prisma db push`

## Auth

**Can't login:** Verify Supabase credentials in `.env`, check project is active, clear cookies

## Search

**No results:** Check content exists, remove filters, verify console

**Slow:** Reduce limits in `lib/fuse-search.ts`, add database indexes

## Gamification

**Achievements not unlocking:** Check `isActive: true`, verify condition logic, check logs

**XP not awarded:** Ensure `logActivity()` called, check `DailyProgress` updates

**Modals not showing:** Verify `GamificationModals` in layout, check polling (5s), verify `seen: false`

## Performance

**Slow pages:** Check database queries, add indexes, optimize API responses

**Slow builds:** `NODE_OPTIONS="--max-old-space-size=4096" npm run build` or `rm -rf .next && npm run build`

## macOS

**File descriptors:** `ulimit -n 65536` (see [FILE_DESCRIPTOR_LIMITS_MACOS.md](./FILE_DESCRIPTOR_LIMITS_MACOS.md))

## Reset

```bash
git stash
npx prisma migrate reset  # Dev only!
rm -rf node_modules package-lock.json .next
npm install && npx prisma generate && npm run build
```
