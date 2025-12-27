# Deployment

Deploy to Vercel + Supabase PostgreSQL.

## Steps

1. `git push -u origin main`
2. [vercel.com/new](https://vercel.com/new) → Import repo → Deploy
3. Vercel → Storage → Create Database → Postgres (Supabase)
4. Add env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GOOGLE_AI_API_KEY` (optional)
5. Pull locally:
   ```bash
   npm i -g vercel && vercel link && vercel env pull .env.local
   ```
6. Update `.env.local`:
   ```env
   DATABASE_URL="${POSTGRES_PRISMA_URL}"
   DIRECT_URL="${POSTGRES_URL_NON_POOLING}"
   ```
7. Run: `npx prisma generate && npx prisma db push`
8. Redeploy in Vercel

## Troubleshooting

- **Can't reach database**: Check DATABASE_URL and DIRECT_URL
- **Invalid Prisma Client**: `npx prisma generate`
- **Auth not working**: Verify Supabase env vars
