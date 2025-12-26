# Study Buddy

A comprehensive learning management system built with Next.js, featuring notes, flashcards, tasks, exams, and a complete gamification system.

## Features

### Core Learning Tools
- **Notes**: Rich text notes with folders, tags, and wiki-style linking
- **Flashcards**: Spaced repetition system using SM-2 algorithm
- **Tasks**: Task management with priorities and due dates
- **Exams**: Create practice tests with multiple question types
- **Focus Timer**: Pomodoro-style study sessions

### Gamification
- **XP & Levels**: Earn experience points for all learning activities
- **60 Achievements**: Badges across 10 categories (Notes, Tasks, Flashcards, Exams, Study, Streaks, etc.)
- **Daily Streaks**: Track consistent daily activity
- **Challenges**: One-time achievements for exceptional daily performance

### Additional Features
- **Dark Mode**: Full theme support
- **Image Uploads**: Add images to notes
- **Knowledge Graph**: Visualize note connections
- **Progress Tracking**: Detailed analytics and activity logs
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Editor**: Tiptap (rich text)
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd study-buddy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Seed achievements (optional):
```bash
npx tsx prisma/seed-achievements.ts
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

### Feature Guides
- [Gamification System](./docs/GAMIFICATION.md) - Complete guide to XP, levels, and achievements
- [Spaced Repetition](./docs/SPACED_REPETITION.md) - How the SM-2 algorithm works
- [Note Linking](./docs/NOTE_LINKING_GUIDE.md) - Wiki-style note connections
- [Color Coding](./docs/COLOR_CODING_GUIDE.md) - Flashcard difficulty colors

### Component Guides
- [Button Component](./docs/BUTTON_COMPONENT_GUIDE.md) - Reusable button system
- [Badge System](./docs/BADGES.md) - Achievement badge creation

### Development
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deploy to Vercel + Supabase
- [Testing Guide](./TESTING_QUICKSTART.md) - How to run tests
- [File Descriptor Limits (macOS)](./docs/FILE_DESCRIPTOR_LIMITS_MACOS.md) - Troubleshooting

### Reference
- [All Achievements](./docs/ALL_ACHIEVEMENTS_LIST.md) - Complete list of 60 badges
- [Gamification Integration](./docs/GAMIFICATION_INTEGRATION.md) - API integration examples

## Project Structure

```
study-buddy/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── gamification/      # Achievement & XP components
│   ├── flashcards/        # Flashcard components
│   ├── notes/             # Note editor & viewer
│   └── tasks/             # Task management
├── lib/                   # Utilities & helpers
│   ├── gamification.ts    # Achievement definitions
│   ├── gamification-service.ts  # XP & achievement logic
│   └── spaced-repetition.ts     # SM-2 algorithm
├── prisma/                # Database schema & migrations
├── docs/                  # Documentation
└── tests/                 # Test files
```

## Key Concepts

### Gamification System

Users earn XP for all actions (creating notes, completing tasks, reviewing flashcards, etc.) and unlock achievements for reaching milestones. The system includes:

- **60 achievements** across 10 categories
- **Level progression** based on cumulative XP
- **Streak tracking** for daily consistency
- **Daily challenges** for one-time exceptional performance

[Learn more in the Gamification Guide](./docs/GAMIFICATION.md)

### Spaced Repetition

Flashcards use the SM-2 algorithm to optimize review timing. Cards are scheduled based on:

- **Ease Factor**: How easy the card is to remember
- **Interval**: Days until next review
- **Quality Rating**: Your recall performance (Wrong, Hard, Good, Easy)

[Learn more in the Spaced Repetition Guide](./docs/SPACED_REPETITION.md)

## Testing

Run tests:
```bash
# All tests
npm test

# Specific tests
npm test gamification

# Visual UI
npm run test:ui

# Coverage report
npm run test:coverage
```

[Read the Testing Quickstart](./TESTING_QUICKSTART.md)

## Deployment

Deploy to Vercel with Supabase (PostgreSQL):

1. Create a Supabase project
2. Copy database connection string
3. Deploy to Vercel
4. Add environment variables
5. Run migrations

[Full deployment guide](./docs/DEPLOYMENT.md)

## Development

### Adding XP Integration

To integrate gamification into a new feature:

```typescript
import { awardXP } from '@/lib/gamification-service';
import { XP_VALUES } from '@/lib/gamification';
import { checkCountBasedAchievements } from '@/lib/achievement-helpers';

// After user completes an action
try {
  await awardXP(userId, XP_VALUES.CREATE_NOTE);
  await checkCountBasedAchievements(userId);
} catch (error) {
  console.error('Gamification error:', error);
}
```

[See complete integration guide](./docs/GAMIFICATION.md)

### Database Migrations

When updating the schema:

```bash
# Create migration
npx prisma migrate dev --name description_of_change

# Apply migration
npx prisma migrate deploy

# Regenerate client
npx prisma generate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:run`
5. Commit with descriptive messages
6. Open a pull request

## Troubleshooting

### Common Issues

**"Too many open files" error (macOS)**
- See [File Descriptor Limits Guide](./docs/FILE_DESCRIPTOR_LIMITS_MACOS.md)

**Prisma client errors**
- Run `npx prisma generate`
- Restart your development server

**Achievement not unlocking**
- Check server logs for errors
- Verify achievement key matches exactly
- Ensure UserProgress record exists

**Tests failing**
- Run `npx prisma generate`
- Restart TypeScript server
- Check test database configuration

## License

MIT

## Acknowledgments

- SuperMemo for the SM-2 algorithm
- Tiptap for the rich text editor
- Next.js team for the amazing framework
- shadcn/ui for component inspiration
