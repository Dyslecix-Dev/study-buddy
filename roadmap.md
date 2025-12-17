# Study Platform MVP - Complete Development Roadmap

## Executive Summary

This roadmap prioritizes features by **value-to-complexity ratio** for a student study platform MVP. The plan is divided into 4 phases over 12-16 weeks, focusing on core features that provide immediate value while building a foundation for advanced capabilities.

---

## Feature Priority Matrix

### Scoring System

- **Priority Score**: 1-10 (business value, user need)
- **Complexity Score**: 1-10 (technical difficulty, time required)
- **MVP Score**: Priority ÷ Complexity (higher is better)

### Feature Rankings

| Rank | Feature                  | Priority | Complexity | MVP Score | Phase |
| ---- | ------------------------ | -------- | ---------- | --------- | ----- |
| 1    | User Auth & Profiles     | 10       | 4          | 2.50      | 1     |
| 2    | Note-Taking (Rich Text)  | 10       | 5          | 2.00      | 1     |
| 3    | Basic Task Management    | 9        | 4          | 2.25      | 1     |
| 4    | Flashcard Creation       | 9        | 5          | 1.80      | 1     |
| 5    | Calendar/Deadline View   | 8        | 4          | 2.00      | 1     |
| 6    | Basic Search             | 8        | 4          | 2.00      | 1     |
| 7    | Pomodoro Timer           | 8        | 3          | 2.67      | 2     |
| 8    | Flashcard Review (Basic) | 9        | 6          | 1.50      | 2     |
| 9    | Tags & Labels            | 7        | 3          | 2.33      | 2     |
| 10   | Progress Dashboard       | 8        | 5          | 1.60      | 2     |
| 11   | Spaced Repetition        | 9        | 7          | 1.29      | 2     |
| 12   | Note Linking             | 7        | 5          | 1.40      | 2     |
| 13   | AI Quiz Generation       | 9        | 8          | 1.13      | 3     |
| 14   | Mind Mapping             | 7        | 7          | 1.00      | 3     |
| 15   | Shared Workspaces        | 8        | 8          | 1.00      | 3     |
| 16   | Real-time Collaboration  | 7        | 9          | 0.78      | 3     |
| 17   | AI Flashcard Generation  | 8        | 8          | 1.00      | 3     |
| 18   | Knowledge Graph View     | 6        | 8          | 0.75      | 4     |
| 19   | Gamification             | 6        | 6          | 1.00      | 4     |
| 20   | Mobile Apps              | 7        | 9          | 0.78      | 4     |

---

## Technology Stack

### Core Stack (Already in Your List)

```javascript
// Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui + Lucide React
- Framer Motion

// Backend & Database
- Next.js API Routes
- PostgreSQL (via Supabase)
- Prisma ORM
- Better Auth

// State Management
- Zustand (global state)
- TanStack Query (server state)
- React Hook Form + Zod (forms)

// Deployment & Monitoring
- Vercel
- Sentry
- Google Analytics
```

### Additional Required Libraries

#### Phase 1 - MVP Core

```bash
# Rich Text Editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image

# Calendar & Dates
npm install date-fns react-big-calendar

# Notifications
npm install sonner

# Search
npm install fuse.js

# Drag & Drop
npm install @hello-pangea/dnd

# Icons & UI Enhancements
npm install lucide-react (already in your list)
npm install cmdk # Command palette
```

#### Phase 2 - Enhanced Features

```bash
# AI Integration (OpenAI)
npm install openai
npm install ai # Vercel AI SDK

# Markdown Support
npm install remark remark-gfm rehype-highlight

# Charts & Analytics
npm install recharts

# File Upload
npm install react-dropzone
# Use Cloudinary for storage (already in your list)

# Spaced Repetition Algorithm
npm install @types/fsrs # Or implement custom SM-2
```

#### Phase 3 - Collaboration

```bash
# Real-time Collaboration
npm install @liveblocks/client @liveblocks/react @liveblocks/node
# Alternative: socket.io (already in your list)

# Email
npm install react-email resend (already in your list)

# PDF Generation
npm install @react-pdf/renderer
npm install react-pdf (already in your list)
```

#### Phase 4 - Advanced

```bash
# Graph Visualization
npm install react-force-graph-2d d3

# Advanced Search
npm install typesense-js # Better than Fuse.js for scale

# Payment (if needed)
npm install stripe @stripe/stripe-js (already in your list)

# Internationalization
npm install next-i18next (already in your list)
```

### Database Schema Overview

```prisma
// prisma/schema.prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  notes         Note[]
  flashcards    Flashcard[]
  tasks         Task[]
  sessions      StudySession[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Note {
  id            String   @id @default(cuid())
  title         String
  content       Json     // Tiptap JSON
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  tags          Tag[]
  linkedNotes   Note[]   @relation("NoteLinks")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Flashcard {
  id            String   @id @default(cuid())
  front         String
  back          String
  deckId        String
  deck          Deck     @relation(fields: [deckId], references: [id])
  reviews       Review[]
  easeFactor    Float    @default(2.5)
  interval      Int      @default(0)
  repetitions   Int      @default(0)
  nextReview    DateTime?
  createdAt     DateTime @default(now())
}

model Task {
  id            String   @id @default(cuid())
  title         String
  description   String?
  completed     Boolean  @default(false)
  dueDate       DateTime?
  priority      Int      @default(0)
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  tags          Tag[]
  createdAt     DateTime @default(now())
}

model StudySession {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  duration      Int      // minutes
  type          String   // 'pomodoro', 'flashcard', 'note'
  completed     Boolean  @default(false)
  startedAt     DateTime @default(now())
  endedAt       DateTime?
}
```

---

## Phase 1: MVP Core (Weeks 1-4)

### Goal

Launch a functional study platform with note-taking, task management, and basic flashcards.

### Features to Implement

#### 1.1 Authentication & User Management

**Complexity: 4/10 | Time: 3-4 days**

```bash
# Install Better Auth
npm install better-auth
```

**Implementation:**

- Email/password signup + login
- Google OAuth (optional but recommended)
- Protected routes middleware
- User profile page with avatar upload (Cloudinary)

**Files to Create:**

```
src/
├── lib/
│   └── auth.ts (Better Auth config)
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── profile/page.tsx
│   └── api/
│       └── auth/[...all]/route.ts
└── middleware.ts (route protection)
```

**Key Code:**

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

---

#### 1.2 Rich Text Note-Taking

**Complexity: 5/10 | Time: 5-7 days**

**Implementation:**

- Tiptap editor with formatting toolbar
- Auto-save every 3 seconds
- Note list with search/filter
- Folder organization
- Image upload support

**Files to Create:**

```
src/
├── components/
│   ├── editor/
│   │   ├── editor.tsx (Tiptap component)
│   │   ├── toolbar.tsx
│   │   └── bubble-menu.tsx
│   └── notes/
│       ├── note-list.tsx
│       ├── note-card.tsx
│       └── note-sidebar.tsx
├── app/
│   └── (dashboard)/
│       └── notes/
│           ├── page.tsx (list view)
│           ├── [id]/page.tsx (editor)
│           └── new/page.tsx
└── lib/
    └── tiptap-extensions.ts
```

**Key Code:**

```typescript
// components/editor/editor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useDebounce } from "@/hooks/use-debounce";

export function Editor({ content, onUpdate }) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
    },
  });

  // Auto-save implementation
  const debouncedContent = useDebounce(editor?.getJSON(), 3000);

  useEffect(() => {
    if (debouncedContent) {
      saveNote(debouncedContent);
    }
  }, [debouncedContent]);

  return <EditorContent editor={editor} />;
}
```

---

#### 1.3 Task Management

**Complexity: 4/10 | Time: 4-5 days**

**Implementation:**

- Create, edit, delete tasks
- Mark complete/incomplete
- Due dates with date picker
- Priority levels (Low, Medium, High)
- Filter by status/priority
- Simple drag-and-drop reordering

**Files to Create:**

```
src/
├── components/
│   └── tasks/
│       ├── task-list.tsx
│       ├── task-item.tsx
│       ├── task-form.tsx
│       └── task-filters.tsx
└── app/
    └── (dashboard)/
        └── tasks/
            └── page.tsx
```

**Key Code:**

```typescript
// components/tasks/task-list.tsx
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export function TaskList({ tasks, onReorder }) {
  return (
    <DragDropContext onDragEnd={onReorder}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => <TaskItem task={task} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} />}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

---

#### 1.4 Basic Flashcards

**Complexity: 5/10 | Time: 5-6 days**

**Implementation:**

- Create flashcard decks
- Add/edit/delete flashcards
- Simple flip animation
- Manual review mode
- Basic statistics (cards studied, accuracy)

**Files to Create:**

```
src/
├── components/
│   └── flashcards/
│       ├── deck-list.tsx
│       ├── flashcard-form.tsx
│       ├── flashcard.tsx (flip card)
│       └── study-session.tsx
└── app/
    └── (dashboard)/
        └── flashcards/
            ├── page.tsx (deck list)
            ├── [deckId]/page.tsx (deck detail)
            └── [deckId]/study/page.tsx
```

**Key Code:**

```typescript
// components/flashcards/flashcard.tsx
export function Flashcard({ front, back }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div className="flashcard" onClick={() => setIsFlipped(!isFlipped)} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: "preserve-3d" }}>
      <div className="flashcard-face front">{front}</div>
      <div className="flashcard-face back" style={{ transform: "rotateY(180deg)" }}>
        {back}
      </div>
    </motion.div>
  );
}
```

---

#### 1.5 Calendar & Deadline View

**Complexity: 4/10 | Time: 3-4 days**

**Implementation:**

- Month/week/day views
- Display tasks with due dates
- Click to view task details
- Color coding by priority

**Files to Create:**

```
src/
├── components/
│   └── calendar/
│       ├── calendar-view.tsx
│       └── event-detail.tsx
└── app/
    └── (dashboard)/
        └── calendar/
            └── page.tsx
```

**Key Code:**

```typescript
// components/calendar/calendar-view.tsx
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function CalendarView({ tasks }) {
  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    resource: task,
  }));

  return <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: 600 }} />;
}
```

---

#### 1.6 Global Search

**Complexity: 4/10 | Time: 2-3 days**

**Implementation:**

- Search across notes, tasks, flashcards
- Fuzzy search with Fuse.js
- Keyboard shortcut (Cmd+K)
- Command palette interface

**Files to Create:**

```
src/
└── components/
    └── search/
        ├── command-palette.tsx
        └── search-results.tsx
```

**Key Code:**

```typescript
// components/search/command-palette.tsx
import { Command } from "cmdk";
import Fuse from "fuse.js";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Cmd+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fuzzy search
  const fuse = new Fuse([...notes, ...tasks, ...flashcards], {
    keys: ["title", "content", "front", "back"],
    threshold: 0.3,
  });

  const results = search ? fuse.search(search) : [];

  return (
    <Command.Dialog open={open} onOpenChange={setOpen}>
      <Command.Input value={search} onValueChange={setSearch} placeholder="Search everything..." />
      <Command.List>
        {results.map((result) => (
          <Command.Item key={result.item.id}>{result.item.title}</Command.Item>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
```

---

### Phase 1 Deliverables Checklist

- [ ] User signup/login with Better Auth
- [ ] Google OAuth integration
- [ ] Profile page with avatar
- [ ] Rich text note editor (Tiptap)
- [ ] Note auto-save
- [ ] Note list and folders
- [ ] Create/edit/delete tasks
- [ ] Task due dates and priorities
- [ ] Drag-and-drop task ordering
- [ ] Create flashcard decks
- [ ] Add flashcards to decks
- [ ] Study mode with flip animation
- [ ] Calendar view of deadlines
- [ ] Global search (Cmd+K)
- [ ] Responsive design (mobile-friendly)
- [ ] Dark mode toggle
- [ ] Basic error handling
- [ ] Loading states
- [ ] Toast notifications (sonner)
- [ ] Deploy to Vercel
- [ ] Setup Sentry error tracking
- [ ] Add Google Analytics

---

## Phase 2: Enhanced Study Features (Weeks 5-8)

### Goal

Add intelligent study tools: spaced repetition, Pomodoro timer, progress tracking, and note linking.

### Features to Implement

#### 2.1 Pomodoro Timer

**Complexity: 3/10 | Time: 2-3 days**

**Implementation:**

- 25/5/15 minute intervals (customizable)
- Start/pause/reset controls
- Audio notification when timer ends
- Session logging to database
- Daily focus time tracking

**Files to Create:**

```
src/
├── components/
│   └── timer/
│       ├── pomodoro-timer.tsx
│       ├── timer-controls.tsx
│       └── timer-settings.tsx
└── app/
    └── (dashboard)/
        └── focus/
            └── page.tsx
```

**Key Code:**

```typescript
// components/timer/pomodoro-timer.tsx
export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Play sound & log session
      playNotificationSound();
      logSession(mode, 25);
      // Switch mode
      setMode(mode === "work" ? "break" : "work");
      setTimeLeft(mode === "work" ? 5 * 60 : 25 * 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  return (
    <div className="timer">
      <div className="time-display">{formatTime(timeLeft)}</div>
      <button onClick={() => setIsRunning(!isRunning)}>{isRunning ? "Pause" : "Start"}</button>
    </div>
  );
}
```

---

#### 2.2 Spaced Repetition System (SM-2 Algorithm)

**Complexity: 7/10 | Time: 6-8 days**

**Implementation:**

- SM-2 algorithm for flashcard scheduling
- Rate cards: Again, Hard, Good, Easy
- Calculate next review date
- Review queue sorted by due date
- Statistics: retention rate, ease factor

**Algorithm Implementation:**

```typescript
// lib/spaced-repetition.ts
interface ReviewResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

export function calculateNextReview(
  card: Flashcard,
  quality: 0 | 1 | 2 | 3 | 4 | 5 // 0=total blackout, 5=perfect response
): ReviewResult {
  let { easeFactor, interval, repetitions } = card;

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // Calculate interval
  if (quality < 3) {
    // Failed recall
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReview };
}
```

**Files to Create:**

```
src/
├── lib/
│   └── spaced-repetition.ts (algorithm)
├── components/
│   └── flashcards/
│       ├── review-session.tsx
│       ├── review-card.tsx
│       └── review-stats.tsx
└── app/
    └── (dashboard)/
        └── review/
            └── page.tsx
```

---

#### 2.3 Tags & Labels System

**Complexity: 3/10 | Time: 2-3 days**

**Implementation:**

- Create custom tags
- Assign tags to notes/tasks/decks
- Color-coded tags
- Filter by tags
- Tag autocomplete

**Files to Create:**

```
src/
├── components/
│   └── tags/
│       ├── tag-input.tsx
│       ├── tag-badge.tsx
│       └── tag-filter.tsx
└── lib/
    └── tag-utils.ts
```

---

#### 2.4 Progress Dashboard

**Complexity: 5/10 | Time: 4-5 days**

**Implementation:**

- Daily/weekly/monthly views
- Study time tracking (from Pomodoro)
- Flashcards reviewed count
- Tasks completed count
- Streaks visualization
- Charts with Recharts

**Files to Create:**

```
src/
├── components/
│   └── dashboard/
│       ├── stats-card.tsx
│       ├── activity-chart.tsx
│       ├── streak-calendar.tsx
│       └── recent-activity.tsx
└── app/
    └── (dashboard)/
        └── page.tsx (main dashboard)
```

**Key Code:**

```typescript
// components/dashboard/activity-chart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function ActivityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="minutes" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

#### 2.5 Note Linking (Wiki-style)

**Complexity: 5/10 | Time: 4-5 days**

**Implementation:**

- [[Note Title]] syntax for links
- Backlinks panel (shows what links to current note)
- Auto-suggest note names
- Click to navigate
- Unlinked mentions

**Files to Create:**

```
src/
├── components/
│   └── notes/
│       ├── note-links.tsx
│       ├── backlinks-panel.tsx
│       └── link-suggestion.tsx
└── lib/
    └── note-linking.ts
```

**Key Code:**

```typescript
// lib/tiptap-extensions.ts
import { Node } from "@tiptap/core";

export const NoteLink = Node.create({
  name: "noteLink",

  addAttributes() {
    return {
      noteId: { default: null },
      noteTitle: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'a[data-type="note-link"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      {
        ...HTMLAttributes,
        "data-type": "note-link",
        href: `/notes/${HTMLAttributes.noteId}`,
      },
      HTMLAttributes.noteTitle,
    ];
  },

  addCommands() {
    return {
      setNoteLink:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});
```

---

### Phase 2 Deliverables Checklist

- [ ] Pomodoro timer with customizable intervals
- [ ] Session logging and tracking
- [ ] Audio notifications
- [ ] SM-2 spaced repetition algorithm
- [ ] Review queue with due cards
- [ ] Rate cards (Again/Hard/Good/Easy)
- [ ] Retention statistics
- [ ] Tag creation and management
- [ ] Tag filtering across features
- [ ] Progress dashboard homepage
- [ ] Study time charts
- [ ] Activity streak calendar
- [ ] Recent activity feed
- [ ] Note linking with [[syntax]]
- [ ] Backlinks panel
- [ ] Auto-suggest note names
- [ ] Performance optimization
- [ ] API rate limiting
- [ ] Database indexing

---

## Phase 3: AI & Collaboration (Weeks 9-12)

### Goal

Add AI-powered content generation and basic collaboration features.

### Features to Implement

#### 3.1 AI Quiz Generation

**Complexity: 8/10 | Time: 6-8 days**

**Setup:**

```bash
npm install openai ai
```

**Implementation:**

- Upload document or paste notes
- AI generates multiple choice questions
- Generate true/false questions
- Generate short answer questions
- Save as quiz or flashcards
- Use streaming for better UX

**Environment Variables:**

```env
OPENAI_API_KEY=sk-...
```

**Files to Create:**

```
src/
├── app/
│   └── api/
│       └── ai/
│           └── generate-quiz/
│               └── route.ts
├── components/
│   └── ai/
│       ├── quiz-generator.tsx
│       ├── quiz-preview.tsx
│       └── generation-progress.tsx
└── lib/
    └── openai.ts
```

**Key Code:**

```typescript
// app/api/ai/generate-quiz/route.ts
import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { content, questionCount, questionType } = await req.json();

  const prompt = `Generate ${questionCount} ${questionType} questions from this text:\n\n${content}\n\nFormat as JSON array with structure: { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..." }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Cheaper alternative
    messages: [{ role: "user", content: prompt }],
    stream: true,
    temperature: 0.7,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

**Cost Management:**

- Use GPT-4o-mini ($0.150 per 1M input tokens)
- Limit: 10 generations per day for free users
- Cache common responses

---

#### 3.2 AI Flashcard Generation

**Complexity: 8/10 | Time: 5-7 days**

**Implementation:**

- Similar to quiz generation
- Extract key terms and definitions
- Generate front/back card pairs
- Categorize by topic
- One-click import to deck

**Files to Create:**

```
src/
├── app/
│   └── api/
│       └── ai/
│           └── generate-flashcards/
│               └── route.ts
└── components/
    └── ai/
        └── flashcard-generator.tsx
```

**Key Code:**

```typescript
// Prompt engineering for better results
const prompt = `
Extract key concepts from this text and create flashcards.
For each concept, create:
- Front: A clear question or term
- Back: A concise, accurate answer (2-3 sentences max)
- Category: Topic area

Text: ${content}

Return as JSON array: [{ "front": "...", "back": "...", "category": "..." }]
`;
```

---

#### 3.3 Mind Mapping Tool

**Complexity: 7/10 | Time: 7-9 days**

**Implementation:**

- Canvas-based mind map editor
- Add/edit/delete nodes
- Connect nodes with lines
- Drag to reposition
- Color coding
- Export as image
- Auto-layout algorithm

**Libraries:**

```bash
npm install reactflow
```

**Files to Create:**

```
src/
├── components/
│   └── mindmap/
│       ├── mindmap-canvas.tsx
│       ├── mindmap-node.tsx
│       ├── mindmap-toolbar.tsx
│       └── mindmap-export.tsx
└── app/
    └── (dashboard)/
        └── mindmaps/
            ├── page.tsx
            └── [id]/page.tsx
```

**Key Code:**

```typescript
// components/mindmap/mindmap-canvas.tsx
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from "reactflow";
import "reactflow/dist/style.css";

export function MindMapCanvas({ initialNodes, initialEdges }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  return (
    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
```

---

#### 3.4 Shared Workspaces (Basic)

**Complexity: 8/10 | Time: 8-10 days**

**Implementation:**

- Create workspace
- Invite members by email
- Role-based permissions (owner, editor, viewer)
- Share notes/decks within workspace
- Activity feed for workspace
- Email notifications (Resend)

**Database Schema Addition:**

```prisma
model Workspace {
  id          String   @id @default(cuid())
  name        String
  ownerId     String
  owner       User     @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  members     WorkspaceMember[]
  notes       Note[]
  decks       Deck[]
  createdAt   DateTime @default(now())
}

model WorkspaceMember {
  id           String    @id @default(cuid())
  workspaceId  String
  workspace    Workspace @relation(fields: [workspaceId], references: [id])
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  role         Role      @default(VIEWER)
  joinedAt     DateTime  @default(now())

  @@unique([workspaceId, userId])
}

enum Role {
  OWNER
  EDITOR
  VIEWER
}
```

**Files to Create:**

```
src/
├── components/
│   └── workspace/
│       ├── workspace-switcher.tsx
│       ├── member-list.tsx
│       ├── invite-modal.tsx
│       └── workspace-settings.tsx
└── app/
    └── (dashboard)/
        └── workspaces/
            ├── [id]/page.tsx
            └── [id]/settings/page.tsx
```

---

#### 3.5 Real-time Collaboration (Optional)

**Complexity: 9/10 | Time: 10-14 days**

**Option A: Liveblocks (Recommended - Easier)**

```bash
npm install @liveblocks/client @liveblocks/react @liveblocks/node
```

**Pricing:**

- Free: Up to 100 MAUs (Monthly Active Users)
- Perfect for MVP

**Implementation:**

```typescript
// liveblocks.config.ts
import { createClient } from "@liveblocks/client";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

export default client;
```

**Option B: Socket.io (More Complex)**

- Requires separate WebSocket server
- Use Railway or Render for hosting
- More control but harder to implement

**Features:**

- See other users' cursors
- Live text editing
- Presence indicators
- Chat in documents

---

### Phase 3 Deliverables Checklist

- [ ] AI quiz generation API
- [ ] Quiz generation UI with streaming
- [ ] Question type selection
- [ ] AI flashcard generation
- [ ] Batch import generated cards
- [ ] Mind map canvas editor
- [ ] Node creation and editing
- [ ] Auto-layout for mind maps
- [ ] Export mind maps as images
- [ ] Workspace creation
- [ ] Invite members by email
- [ ] Permission system
- [ ] Workspace activity feed
- [ ] Email notifications (Resend)
- [ ] Real-time collaboration (optional)
- [ ] Cursor presence
- [ ] API usage tracking for AI
- [ ] Rate limiting for AI features
- [ ] Cost monitoring dashboard

---

## Phase 4: Advanced Features (Weeks 13-16)

### Goal

Polish the application with advanced features, mobile optimization, and gamification.

### Features to Implement

#### 4.1 Knowledge Graph Visualization

**Complexity: 8/10 | Time: 7-10 days**

**Implementation:**

- 2D force-directed graph
- Nodes = notes
- Edges = links between notes
- Click node to open note
- Filter by tags
- Zoom and pan
- Highlight connected notes

**Libraries:**

```bash
npm install react-force-graph-2d d3
```

**Files to Create:**

```
src/
├── components/
│   └── graph/
│       ├── knowledge-graph.tsx
│       ├── graph-controls.tsx
│       └── node-detail.tsx
└── app/
    └── (dashboard)/
        └── graph/
            └── page.tsx
```

**Key Code:**

```typescript
// components/graph/knowledge-graph.tsx
import ForceGraph2D from "react-force-graph-2d";

export function KnowledgeGraph({ notes }) {
  const graphData = {
    nodes: notes.map((note) => ({
      id: note.id,
      name: note.title,
      val: note.linkedNotes.length + 1, // Size by connections
    })),
    links: notes.flatMap((note) =>
      note.linkedNotes.map((linked) => ({
        source: note.id,
        target: linked.id,
      }))
    ),
  };

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="name"
      nodeColor={(node) => `hsl(${node.val * 30}, 70%, 50%)`}
      onNodeClick={(node) => router.push(`/notes/${node.id}`)}
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={0.005}
    />
  );
}
```

---

#### 4.2 Gamification System

**Complexity: 6/10 | Time: 5-7 days**

**Implementation:**

- XP points for actions
- Level system (1-100)
- Badges/achievements
- Daily streaks
- Leaderboard (optional)
- Progress bars

**XP System:**

```typescript
// lib/gamification.ts
export const XP_VALUES = {
  CREATE_NOTE: 5,
  COMPLETE_TASK: 10,
  STUDY_SESSION: 15,
  REVIEW_FLASHCARD: 2,
  DAILY_LOGIN: 10,
  WEEK_STREAK: 50,
};

export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

export function getNextLevelXP(currentLevel: number): number {
  return currentLevel ** 2 * 100;
}
```

**Achievements:**

```typescript
export const ACHIEVEMENTS = [
  {
    id: "first-note",
    name: "First Steps",
    description: "Create your first note",
    icon: "📝",
    xp: 10,
  },
  {
    id: "study-streak-7",
    name: "Dedicated Student",
    description: "Study 7 days in a row",
    icon: "🔥",
    xp: 100,
  },
  {
    id: "flashcard-master",
    name: "Memory Champion",
    description: "Review 1000 flashcards",
    icon: "🧠",
    xp: 500,
  },
  // Add 20-30 more achievements
];
```

**Files to Create:**

```
src/
├── components/
│   └── gamification/
│       ├── xp-bar.tsx
│       ├── achievement-toast.tsx
│       ├── badge-collection.tsx
│       └── leaderboard.tsx
└── lib/
    └── gamification.ts
```

---

#### 4.3 Mobile Optimization

**Complexity: 6/10 | Time: 5-7 days**

**Implementation:**

- Responsive layouts for all pages
- Touch-optimized controls
- Mobile navigation menu
- PWA support
- Offline mode (basic)
- Pull-to-refresh

**PWA Setup:**

```typescript
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  // Your Next.js config
});
```

**Manifest:**

```json
// public/manifest.json
{
  "name": "StudyFlow",
  "short_name": "StudyFlow",
  "description": "AI-powered study platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

#### 4.4 Advanced Search with Filters

**Complexity: 5/10 | Time: 4-5 days**

**Implementation:**

- Replace Fuse.js with Typesense for better performance
- Full-text search
- Filter by type, date, tags
- Search syntax: `tag:math due:today`
- Relevance scoring
- Search history

**Setup Typesense:**

```bash
# Free tier: https://cloud.typesense.org/
npm install typesense
```

**Implementation:**

```typescript
// lib/typesense.ts
import Typesense from "typesense";

export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST!,
      port: 443,
      protocol: "https",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY!,
});

export async function indexNote(note: Note) {
  await typesenseClient
    .collections("notes")
    .documents()
    .create({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags.map((t) => t.name),
      created_at: note.createdAt.getTime(),
    });
}
```

---

#### 4.5 Export & Data Portability

**Complexity: 4/10 | Time: 3-4 days**

**Implementation:**

- Export notes as Markdown
- Export flashcards as CSV/Anki format
- Export tasks as CSV
- Backup all data as ZIP
- Import from other platforms

**Files to Create:**

```
src/
├── components/
│   └── export/
│       ├── export-dialog.tsx
│       └── import-dialog.tsx
└── lib/
    └── export-utils.ts
```

**Key Code:**

```typescript
// lib/export-utils.ts
export async function exportNotesAsMarkdown(notes: Note[]) {
  const zip = new JSZip();

  for (const note of notes) {
    const markdown = convertTiptapToMarkdown(note.content);
    zip.file(`${note.title}.md`, markdown);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "notes-export.zip");
}

export function exportFlashcardsAsAnki(deck: Deck) {
  const csv = [["front", "back", "tags"], ...deck.flashcards.map((card) => [card.front, card.back, card.tags.join(",")])];

  const csvContent = csv.map((row) => row.join(",")).join("\n");
  downloadText(csvContent, `${deck.name}.csv`);
}
```

---

### Phase 4 Deliverables Checklist

- [ ] Knowledge graph visualization
- [ ] Interactive graph navigation
- [ ] XP and leveling system
- [ ] Achievement badges (20+)
- [ ] Streak tracking
- [ ] Leaderboard (optional)
- [ ] Mobile-responsive layouts
- [ ] PWA support
- [ ] Offline mode basics
- [ ] Touch-optimized UI
- [ ] Advanced search with Typesense
- [ ] Search filters and syntax
- [ ] Export notes as Markdown
- [ ] Export flashcards as CSV/Anki
- [ ] Full data backup
- [ ] Import from other platforms
- [ ] Performance optimization
- [ ] SEO optimization (next-seo)
- [ ] Comprehensive testing
- [ ] User documentation

---

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)

```typescript
// __tests__/components/timer.test.tsx
import { render, screen, act } from "@testing-library/react";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";

describe("PomodoroTimer", () => {
  it("counts down from 25 minutes", () => {
    render(<PomodoroTimer />);
    expect(screen.getByText("25:00")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(60000); // 1 minute
    });

    expect(screen.getByText("24:00")).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("user can sign up and create first note", async ({ page }) => {
  await page.goto("/signup");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");

  await page.click("text=New Note");
  await page.fill('[placeholder="Note title"]', "My First Note");
  await page.fill(".tiptap", "This is my first note content");

  await expect(page.locator("text=My First Note")).toBeVisible();
});
```

---

## Deployment Checklist

### Vercel Configuration

```javascript
// vercel.json
{
  "buildCommand": "prisma generate && next build",
  "env": {
    "DATABASE_URL": "@database-url",
    "OPENAI_API_KEY": "@openai-api-key",
    "BETTER_AUTH_SECRET": "@auth-secret",
    "CLOUDINARY_URL": "@cloudinary-url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# AI
OPENAI_API_KEY=sk-...

# Storage
CLOUDINARY_URL=cloudinary://...

# Email
RESEND_API_KEY=re_...

# Monitoring
SENTRY_DSN=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# Search (Optional)
TYPESENSE_HOST=...
TYPESENSE_API_KEY=...

# Collaboration (Optional)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=...
LIVEBLOCKS_SECRET_KEY=...
```

### Pre-launch Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Sentry error tracking configured
- [ ] Google Analytics set up
- [ ] SEO meta tags on all pages
- [ ] Open Graph images
- [ ] Sitemap.xml generated
- [ ] robots.txt configured
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] API endpoints documented
- [ ] User onboarding flow tested
- [ ] Mobile responsiveness verified
- [ ] Performance tested (Lighthouse 90+)
- [ ] Accessibility tested (WCAG AA)
- [ ] Cross-browser testing done
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Contact/support page

---

## Performance Optimization

### Code Splitting

```typescript
// Use dynamic imports for heavy components
import dynamic from "next/dynamic";

const MindMapCanvas = dynamic(() => import("@/components/mindmap/mindmap-canvas"), { ssr: false, loading: () => <LoadingSpinner /> });
```

### Image Optimization

```typescript
// Always use Next.js Image
import Image from "next/image";

<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority placeholder="blur" />;
```

### Database Optimization

```prisma
// Add indexes to frequently queried fields
model Note {
  @@index([userId])
  @@index([createdAt])
  @@index([userId, createdAt])
}

model Flashcard {
  @@index([deckId])
  @@index([nextReview])
  @@index([userId, nextReview])
}
```

### Caching Strategy

```typescript
// Use TanStack Query for caching
export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

---

## Monitoring & Analytics

### Sentry Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return event;
  },
});
```

### Custom Analytics Events

```typescript
// lib/analytics.ts
export function trackEvent(eventName: string, properties?: object) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, properties);
  }
}

// Usage
trackEvent("flashcard_created", { deckId: deck.id });
trackEvent("study_session_completed", { duration: 25, type: "pomodoro" });
```

---

## Cost Estimates (Monthly)

### Free Tier Services

- **Vercel**: Free for hobby projects
- **Supabase**: Free (500MB DB, 2GB bandwidth)
- **Better Auth**: Free (self-hosted)
- **Cloudinary**: Free (25GB storage, 25GB bandwidth)
- **Resend**: Free (3,000 emails/month)
- **Sentry**: Free (5k errors/month)
- **Google Analytics**: Free
- **Liveblocks**: Free (100 MAUs)
- **GitHub Actions**: Free (2,000 minutes/month)

### Paid Services (After Growth)

- **OpenAI API**: ~$20-50/month (GPT-4o-mini)
  - ~200-500 quiz generations @ $0.10 each
- **Typesense Cloud**: Free (1M operations)
- **Railway/Render** (if needed): $5-10/month
- **Custom domain**: $12/year (~$1/month)

**Estimated Total Cost for MVP: $0-5/month**
**After 1000 users: $50-100/month**

---

## Launch Marketing Checklist

### Pre-Launch (2-4 weeks before)

- [ ] Create landing page
- [ ] Set up email waitlist
- [ ] Prepare demo video (Loom)
- [ ] Write blog post announcement
- [ ] Create social media accounts
- [ ] Design promotional graphics (Figma)
- [ ] Prepare Product Hunt launch
- [ ] List on BetaList
- [ ] Reach out to student communities

### Launch Day

- [ ] Post on Product Hunt
- [ ] Share on Twitter/X
- [ ] Post in relevant Reddit communities
  - r/studying, r/productivity, r/GetStudying
- [ ] Share on LinkedIn
- [ ] Email waitlist subscribers
- [ ] Post in Indie Hackers
- [ ] Share in student Discord servers

### Post-Launch (First Month)

- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Send user surveys
- [ ] Create tutorial videos
- [ ] Write "How to" blog posts
- [ ] Engage with users on social media
- [ ] Monitor analytics daily
- [ ] Iterate on user feedback

---

## Success Metrics

### Week 1 Goals

- 50 signups
- 20 active users (DAU)
- 100+ notes created
- 50+ flashcards created
- 0 critical bugs

### Month 1 Goals

- 500 signups
- 150 DAU (30% retention)
- 5,000+ notes created
- 2,000+ flashcards created
- 100+ study sessions logged
- 4.5+ star rating (if collecting)

### Month 3 Goals

- 2,000 signups
- 500 DAU (25% retention)
- 20,000+ notes created
- 10,000+ flashcards reviewed
- 1,000+ hours studied
- 10+ testimonials

### Key Metrics to Track

- **Activation**: % who create first note/flashcard
- **Retention**: DAU/MAU, weekly retention cohorts
- **Engagement**: Avg. session duration, features used
- **Viral**: Invite rate, referral signups
- **Revenue** (if monetizing): MRR, ARPU, churn rate

---

## Future Enhancements (Post-MVP)

### Phase 5+

1. **Mobile native apps** (React Native or Flutter)
2. **Browser extension** (save content as notes)
3. **Integrations**: Google Calendar, Notion, Evernote
4. **Voice notes** (speech-to-text)
5. **Study group features** (chat, video calls)
6. **Marketplace**: Share/sell decks and templates
7. **Advanced analytics**: Learning insights, predictions
8. **Offline-first**: Full offline support with sync
9. **Plugin system**: Custom integrations
10. **AI tutor**: Conversational study assistant

---

## Conclusion

This roadmap provides a comprehensive 16-week plan to build and launch a competitive study platform MVP. Focus on executing Phase 1 perfectly before moving to Phase 2.

### Key Success Factors

1. **Start simple**: Don't over-engineer Phase 1
2. **User feedback**: Talk to users every week
3. **Ship fast**: Release every Friday
4. **Measure everything**: Track all key metrics
5. **Stay focused**: Don't add features without validation

### Next Steps

1. Set up your development environment
2. Initialize Next.js project with TypeScript
3. Set up Supabase database
4. Create basic authentication
5. Start building! 🚀

Good luck with your study platform! Remember: Done is better than perfect for an MVP.

---

## Additional Resources

### Learning Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tiptap Docs**: https://tiptap.dev
- **Better Auth**: https://better-auth.com
- **TanStack Query**: https://tanstack.com/query
- **Spaced Repetition**: https://en.wikipedia.org/wiki/Spaced_repetition

### Design Inspiration

- **Dribbble**: Search "study app", "note taking"
- **Mobbin**: Mobile app design patterns
- **SaaS Landing Pages**: https://saaslandingpage.com

### Communities

- **Indie Hackers**: Share your journey
- **r/SideProject**: Get feedback
- **Product Hunt**: Launch platform
- **Twitter/X**: Build in public

### Tools

- **Figma**: Design mockups first
- **Linear**: Project management
- **Notion**: Documentation
- **Loom**: Screen recordings for feedback

---

**Last Updated**: 2024
**Version**: 1.0
**Author**: Study Platform MVP Roadmap
