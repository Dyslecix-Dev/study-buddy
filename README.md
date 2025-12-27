# Study Buddy

Learning management system: notes, flashcards, tasks, exams, gamification.

## Tech Stack

Next.js 16, React 19, TypeScript, PostgreSQL + Prisma, Supabase Auth, Tailwind, Tiptap, Fuse.js, Google AI

## Quick Setup

```bash
git clone <repo> && cd study-buddy
npm install
cp .env.example .env  # Add DATABASE_URL, Supabase credentials, GOOGLE_AI_API_KEY
npx prisma db push && npx prisma generate
npm run dev  # http://localhost:3000
```

## Environment Variables

**Required:** `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Optional:** `GOOGLE_AI_API_KEY` (for AI flashcard/exam generation)

## Structure

```
app/(auth)/           # Login/signup
app/(dashboard)/      # Main app
app/api/              # API routes
components/           # React components
lib/                  # Utils
prisma/schema.prisma  # Database
docs/                 # Documentation
```

## Features

- **Notes**: Rich text + wiki links (`[[Title]]`)
- **Flashcards**: SM-2 spaced repetition
- **Tasks**: Priorities, due dates
- **Exams**: Multiple question types
- **Gamification**: 60 achievements, XP, levels (1-100)
- **Search**: Fuse.js with filters (`type:note tag:math due:today`)
- **AI**: Auto-generate flashcards/exams from notes

## Commands

```bash
npm run dev              # Dev server
npm test                # Run tests
npm run build           # Production build
npx prisma studio       # Database GUI
npx prisma generate     # Regenerate client
npx prisma db push      # Push schema changes
```

## Documentation

- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deploy to Vercel
- [docs/TESTING_QUICKSTART.md](./docs/TESTING_QUICKSTART.md) - Testing
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Common issues
- [docs/features/](./docs/features/) - Feature guides
- [docs/AI_EXAM_GENERATION.md](./docs/AI_EXAM_GENERATION.md) - AI exam generation
- [docs/AI_FLASHCARD_GENERATION.md](./docs/AI_FLASHCARD_GENERATION.md) - AI flashcard generation

## Add Gamification

```typescript
import { checkAndAwardAchievements } from "@/lib/gamification-service";
import { logActivity } from "@/lib/activity-logger";

await logActivity({ userId, type: "note_created", entityType: "note", entityId: note.id });
await checkAndAwardAchievements(userId, "note_created", { noteId: note.id });
```

## Database Changes

```bash
# Edit prisma/schema.prisma, then:
npx prisma db push && npx prisma generate
```

## License

MIT
