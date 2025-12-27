# Documentation Index

**Study Buddy** - Complete documentation navigation guide.

## 📖 Start Here

**New to the project?** Read these in order:

1. **[README.md](./README.md)** - Main documentation hub
   - Project overview
   - Quick setup guide
   - Architecture explanation
   - Common development tasks

2. **[TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md)** - Testing guide
   - Unit tests with Vitest
   - E2E tests with Cypress
   - Running tests

3. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
   - Production deployment steps
   - Environment configuration
   - Hosting recommendations

---

## 🎯 Feature Documentation

### Core Features

| Feature | File | What It Covers |
|---------|------|----------------|
| **Gamification** | [features/GAMIFICATION.md](./features/GAMIFICATION.md) | XP system, levels, achievements (60 total), badges, modals |
| **Advanced Search** | [features/SEARCH.md](./features/SEARCH.md) | Typesense setup, search syntax, filters, indexing |
| **Note Linking** | [features/NOTE_LINKING.md](./features/NOTE_LINKING.md) | Wiki-style links, backlinks, knowledge graph |
| **Sharing** | [features/SHARING.md](./features/SHARING.md) | Content sharing, email notifications, permissions |
| **Spaced Repetition** | [features/SPACED_REPETITION.md](./features/SPACED_REPETITION.md) | SM-2 algorithm, flashcard scheduling, review system |

### Supporting Documentation

| Topic | File | What It Covers |
|-------|------|----------------|
| **UI Components** | [components/UI_COMPONENTS.md](./components/UI_COMPONENTS.md) | Design system, color theme, buttons, badges, patterns |
| **Achievements List** | [ALL_ACHIEVEMENTS_LIST.md](./ALL_ACHIEVEMENTS_LIST.md) | Complete list of 60 achievements with details |
| **Troubleshooting** | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues, solutions, debugging tips |

---

## 🗂️ Documentation Structure

```
docs/
├── README.md                           # Main documentation hub
├── DOCUMENTATION_INDEX.md              # This file - navigation guide
├── TESTING_QUICKSTART.md               # Testing guide
├── DEPLOYMENT.md                       # Deployment instructions
├── TROUBLESHOOTING.md                  # Common issues & fixes
├── ALL_ACHIEVEMENTS_LIST.md            # Complete achievement reference
├── FILE_DESCRIPTOR_LIMITS_MACOS.md     # macOS-specific fix
├── SPACED_REPETITION.md                # SM-2 algorithm (legacy, see features/)
│
├── features/                           # Feature-specific guides
│   ├── GAMIFICATION.md                 # Complete gamification guide
│   ├── SEARCH.md                       # Advanced search system
│   ├── NOTE_LINKING.md                 # Note linking & graph
│   ├── SHARING.md                      # Content sharing
│   └── SPACED_REPETITION.md            # Flashcard algorithm
│
├── components/                         # Component documentation
│   └── UI_COMPONENTS.md                # Design system & UI guide
│
└── archive/                            # Detailed legacy docs
    ├── ADVANCED_SEARCH.md              # Original detailed search docs (600+ lines)
    ├── ADVANCED_SEARCH_IMPLEMENTATION.md
    ├── MIGRATION_TO_ADVANCED_SEARCH.md
    ├── SEARCH_SETUP_GUIDE.md
    ├── NOTE_LINKING_GUIDE.md           # Original detailed linking docs (750+ lines)
    ├── GAMIFICATION_*.md               # Original gamification docs
    ├── SHARING_*.md                    # Original sharing docs
    ├── BUTTON_COMPONENT_GUIDE.md       # Original component docs
    ├── COLOR_CODING_GUIDE.md
    ├── BADGES.md
    └── badge.md
```

---

## 🎓 Learning Paths

### Path 1: Frontend Developer

1. Read [README.md](./README.md) - Architecture & setup
2. Read [components/UI_COMPONENTS.md](./components/UI_COMPONENTS.md) - Design system
3. Study component files in `/components`
4. Read feature docs as needed

### Path 2: Backend Developer

1. Read [README.md](./README.md) - Architecture & setup
2. Study `prisma/schema.prisma` - Database models
3. Review API routes in `/app/api`
4. Read [features/GAMIFICATION.md](./features/GAMIFICATION.md) - Complex backend logic
5. Read [features/SEARCH.md](./features/SEARCH.md) - External service integration

### Path 3: Full Stack Developer

1. Read [README.md](./README.md) - Complete overview
2. Read [TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md) - Testing approach
3. Read all feature docs in order:
   - [GAMIFICATION.md](./features/GAMIFICATION.md)
   - [SEARCH.md](./features/SEARCH.md)
   - [NOTE_LINKING.md](./features/NOTE_LINKING.md)
   - [SHARING.md](./features/SHARING.md)
   - [SPACED_REPETITION.md](./features/SPACED_REPETITION.md)
4. Read [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment

### Path 4: Designer/UI Developer

1. Read [components/UI_COMPONENTS.md](./components/UI_COMPONENTS.md) - Design system
2. Review `/public` for assets
3. Study `app/globals.css` - Theme variables
4. Review component files for patterns
5. Check [archive/BADGES.md](./archive/BADGES.md) for badge design specs

---

## 📚 Quick Reference

### Most Used Commands

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Build for production
npm run test                # Run unit tests
npm run cypress             # Open Cypress UI

# Database
npx prisma generate         # Generate Prisma client
npx prisma db push         # Push schema changes
npx prisma studio          # Open database GUI
npx prisma migrate reset   # Reset database (dev only!)

# Search (if using Typesense)
curl -X POST http://localhost:3000/api/search/init
curl -X PUT http://localhost:3000/api/search/index

# Debugging
npx tsc --noEmit           # Type check
npm run lint               # Lint code
lsof -ti:3000 | xargs kill -9  # Kill port 3000
```

### Environment Setup Checklist

- [ ] `.env` created from `.env.example`
- [ ] Database URL configured
- [ ] Supabase credentials added
- [ ] `npx prisma db push` run
- [ ] `npx prisma generate` run
- [ ] `npm install` completed
- [ ] `npm run dev` starts successfully
- [ ] Can create account and log in
- [ ] Optional: Typesense configured for search
- [ ] Optional: Resend configured for emails

### Feature Implementation Checklist

When adding gamification to a feature:
- [ ] Call `logActivity()` after action
- [ ] Call `checkAndAwardAchievements()` after action
- [ ] Test XP is awarded
- [ ] Test achievement unlocks
- [ ] Verify modal appears

When adding search to content:
- [ ] Create indexing function in `lib/search-indexing.ts`
- [ ] Call index function after create/update
- [ ] Call delete function after delete
- [ ] Add to search schema in `lib/typesense.ts`
- [ ] Test search results appear

---

## 🔍 Finding Information

### "How do I...?"

| Question | Documentation |
|----------|--------------|
| Set up the project? | [README.md](./README.md#getting-started) |
| Add a new API endpoint? | [README.md](./README.md#creating-a-new-api-endpoint) |
| Integrate gamification? | [features/GAMIFICATION.md](./features/GAMIFICATION.md#implementation-guide) |
| Set up advanced search? | [features/SEARCH.md](./features/SEARCH.md#setup-guide) |
| Create note links? | [features/NOTE_LINKING.md](./features/NOTE_LINKING.md#creating-links) |
| Share content? | [features/SHARING.md](./features/SHARING.md#sharing-content) |
| Implement spaced repetition? | [features/SPACED_REPETITION.md](./features/SPACED_REPETITION.md#usage-example) |
| Use UI components? | [components/UI_COMPONENTS.md](./components/UI_COMPONENTS.md) |
| Fix a build error? | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#build--development-issues) |
| Deploy to production? | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Run tests? | [TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md) |

### "Where is...?"

| Looking for | Location |
|-------------|----------|
| Database schema | `prisma/schema.prisma` |
| API routes | `app/api/*` |
| Components | `components/*` |
| Utility functions | `lib/*` |
| Tests | `tests/*` and `cypress/e2e/*` |
| Gamification logic | `lib/gamification-service.ts` |
| Search logic | `lib/advanced-search.ts` |
| Spaced repetition algorithm | `lib/spaced-repetition.ts` |
| Achievement definitions | Database or [ALL_ACHIEVEMENTS_LIST.md](./ALL_ACHIEVEMENTS_LIST.md) |

---

## 📝 Documentation Guidelines

### For Future Contributors

When adding documentation:

1. **Keep it concise** - Essential info only
2. **Use examples** - Code snippets help
3. **Update this index** - Add new docs here
4. **Link related files** - Cross-reference
5. **Test instructions** - Verify they work

### Documentation Tiers

**Tier 1: Essential** (Must read)
- README.md
- Feature guides in `/features`
- TROUBLESHOOTING.md

**Tier 2: Reference** (Read as needed)
- Component guides
- ALL_ACHIEVEMENTS_LIST.md
- TESTING_QUICKSTART.md
- DEPLOYMENT.md

**Tier 3: Archive** (Historical/detailed)
- Files in `/archive`
- Original implementation docs
- Detailed migration guides

---

## 🆘 Getting Help

If you can't find what you need:

1. **Search this index** - Use Cmd+F
2. **Check TROUBLESHOOTING.md** - Common issues
3. **Review feature docs** - Detailed guides
4. **Check archive/** - Original detailed docs
5. **Read the code** - Often self-documenting
6. **Ask the team** - Create GitHub issue

---

## 📦 Archive

The `/archive` directory contains original, detailed documentation that was condensed into the main guides. These files are preserved for:

- Historical reference
- Detailed implementation context
- Migration guides
- Design specifications

**Archived Topics:**
- Advanced Search (3 detailed docs)
- Gamification (4 detailed docs)
- Sharing (2 detailed docs)
- Note Linking (1 detailed guide)
- UI Components (3 detailed guides)

Access these if you need:
- Step-by-step migration instructions
- Detailed architecture decisions
- Complete design specifications
- Historical context

---

**Documentation Version:** 2.0
**Last Updated:** December 2024
**Condensed From:** 21 original files → 13 core files + 16 archived

**Changes:**
- ✅ Created central navigation hub
- ✅ Consolidated related documents
- ✅ Organized by feature
- ✅ Added quick reference sections
- ✅ Preserved detailed docs in archive
- ✅ Improved searchability

**Future developers:** This structure is designed for quick navigation. Start with README.md, then jump to relevant feature docs. Archive contains full details if needed.
