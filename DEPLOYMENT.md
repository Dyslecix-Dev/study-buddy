# Study Buddy - Deployment Guide

## Quick Deploy to Vercel with Supabase

### Step 1: Push to GitHub
```bash
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your `study-buddy` repository
3. Click **Deploy** (no configuration needed yet)

### Step 3: Add Supabase Database
1. In your Vercel project, go to **Storage** tab
2. Click **Create Database**
3. Select **Postgres (Powered by Supabase)**
4. Click **Continue**
5. Accept the terms and create the database

Vercel will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 4: Add Supabase Auth Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add these variables (you'll get them from the Supabase dashboard Vercel shows):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 5: Update Environment Variables Locally
In your project root:
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link to your Vercel project
vercel link

# Pull environment variables
vercel env pull .env.local
```

### Step 6: Update .env.local
After pulling, you may need to add these mappings to `.env.local`:
```env
DATABASE_URL="${POSTGRES_PRISMA_URL}"
DIRECT_URL="${POSTGRES_URL_NON_POOLING}"
```

### Step 7: Run Prisma Migrations
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 8: Redeploy on Vercel
Go back to Vercel and trigger a new deployment, or push a commit to trigger auto-deploy.

## Local Development

1. Make sure you have `.env.local` with all variables
2. Run migrations: `npx prisma db push`
3. Generate Prisma client: `npx prisma generate`
4. Start dev server: `npm run dev`

## Environment Variables Reference

### Required
- `DATABASE_URL` - Prisma connection URL (pooled)
- `DIRECT_URL` - Direct connection for migrations
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Optional (for later phases)
- `OPENAI_API_KEY` - For AI features (Phase 3)
- `CLOUDINARY_URL` - For image uploads

## Troubleshooting

### "Can't reach database server"
- Check that `DATABASE_URL` and `DIRECT_URL` are set correctly
- Ensure you're using the pooled URL for `DATABASE_URL`
- Ensure you're using the direct URL for `DIRECT_URL`

### "Invalid Prisma Client"
Run `npx prisma generate` to regenerate the client

### Authentication not working
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check that middleware is running correctly
- Ensure you've pushed the database schema
