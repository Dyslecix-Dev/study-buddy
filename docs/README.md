# Developer Guide

## Quick Start

```bash
git clone <repo> && cd study-buddy
npm install
cp .env.example .env  # Add DATABASE_URL, Supabase credentials
npx prisma db push && npx prisma generate
npm run dev
```

## Tech Stack

Next.js 16, React 19, TypeScript, PostgreSQL + Prisma, Supabase Auth, Tailwind, Tiptap, Fuse.js, Google AI

## Structure

```
app/(auth)/           # Auth pages
app/(dashboard)/      # Main app
app/api/              # API routes
components/           # React components
lib/                  # Utils
prisma/schema.prisma  # Database
```

## Add Feature

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push && npx prisma generate`
3. Create API routes in `app/api/`
4. Build components
5. Test: `npm test`

## API Pattern

```typescript
// app/api/example/route.ts
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const data = await prisma.model.findMany({ where: { userId: user.id } });
  return NextResponse.json({ data });
}
```

## Add Gamification

```typescript
await logActivity({ userId, type, entityType, entityId, title });
await checkAndAwardAchievements(userId, eventType, metadata);
```

## Commands

```bash
npm run dev           # Dev server
npm test             # Run tests
npx prisma studio    # Database GUI
npx prisma generate  # Regenerate client
```

See [features/](./features/) for detailed guides.
