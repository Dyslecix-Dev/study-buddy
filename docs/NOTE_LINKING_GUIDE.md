# Wiki-Style Note Linking - Complete Guide

## 📖 Table of Contents

1. [Quick Start (5 Minutes)](#quick-start)
2. [Core Features](#core-features)
3. [Advanced Features](#advanced-features)
4. [User Testing Guide](#user-testing-guide)
5. [Technical Implementation](#technical-implementation)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Your First Link (2 minutes)

1. **Open any note** in edit mode
2. **Type `[[`** anywhere in your text
3. A dropdown appears - start typing a note title
4. Press **Enter** or click to select
5. ✅ Done! You've created a wiki-style link

**Example:**
```
"This concept relates to [[Introduction to React]] and [[TypeScript Basics]]"
```

The linked text will appear as a blue badge that you can click to navigate.

### View Your Connections (1 minute)

Scroll to the bottom of any note to see:

- **Linked Notes** - Notes you've linked to
- **Backlinks** - Notes that link to this note
- **Unlinked Mentions** - Places where note titles appear but aren't linked yet

### Explore the Knowledge Graph (2 minutes)

Navigate to `/graph` in your app to see:

- Interactive visualization of all notes
- Node size based on connection count
- Click any node to open that note
- Use fullscreen mode for better exploration

---

## 🎯 Core Features

### 1. [[Note Title]] Syntax

**How it works:**
- Type `[[` to trigger autocomplete
- Search shows up to 10 matching notes
- Case-insensitive search
- Real-time as you type

**Keyboard Shortcuts:**
- `↑` / `↓` - Navigate suggestions
- `Enter` - Select suggestion
- `Esc` - Cancel

**Mouse:**
- Click any suggestion to select
- Hover for preview (advanced feature)

### 2. Auto-suggest Dropdown

The suggestion dropdown is smart:
- Searches note titles instantly
- Shows most recently updated notes first
- Limited to 10 results for speed
- Updates as you type

**Technical:** Uses `/api/notes/search?q={query}` endpoint with database query.

### 3. Backlinks Panel

Located at the bottom of each note:

**Linked Notes Section:**
- Shows all notes this note links to
- Click to navigate to any note
- Shows count of outgoing links

**Backlinks Section:**
- Shows notes that link to this note
- Helps discover connections you didn't know about
- Great for finding related content

### 4. Auto-save

Links are automatically saved:
- 2-second debounce after you stop typing
- "Saved" indicator appears when complete
- No manual save button needed

### 5. Clickable Links

Note links are styled as:
- Blue badges in light mode
- Darker blue in dark mode
- Hover effect shows they're clickable
- Click to navigate to that note

---

## 🚀 Advanced Features

### 1. Unlinked Mentions Detection

**What it does:**
Automatically scans your note for mentions of other note titles that aren't linked yet.

**How to use:**
1. Write a note mentioning other notes by their exact title
2. Scroll down to "Unlinked Mentions" panel
3. See a list of notes mentioned but not linked
4. Click "Link All" to convert all mentions to links

**Example:**
If you write "React is great. React has hooks. React is fast." and have a note titled "React", the Unlinked Mentions panel will show "React - 3 mentions" with a "Link All" button.

**Features:**
- Real-time detection (1-second debounce)
- Case-insensitive matching
- Shows top 5 most-mentioned notes
- Collapsible to keep UI clean

### 2. Bulk Link Conversion

**When to use:**
- You wrote a long note and want to add links at the end
- You mentioned a concept many times
- You want to quickly convert all references

**How it works:**
1. Look in "Unlinked Mentions" panel
2. Find the note you want to link
3. Click "Link All"
4. All occurrences become links instantly

**Smart features:**
- Doesn't double-link existing links
- Word boundary detection (won't link "React" inside "Reaction")
- Case-insensitive
- Success notification

### 3. Link Preview on Hover

**How to use:**
- Hover over any note link for 0.5 seconds
- A preview card appears showing:
  - Note title
  - Last updated time
  - First 200 characters of content
  - Tags (up to 3)

**Benefits:**
- Quick reference without navigating away
- See if it's the note you're thinking of
- Preview tags to understand context

**Technical:**
- 500ms delay before showing
- 200ms delay before hiding (allows mouse movement)
- Fetches on demand (not preloaded)
- Cached after first load

### 4. Broken Link Detection

**What it does:**
Automatically detects when you've linked to a note that was deleted.

**How to use:**
1. Link to a note
2. Delete that note
3. Open notes that linked to it
4. See red warning banner: "Broken Links Detected"
5. Click "Remove broken links" to clean up

**Features:**
- Real-time checking (2-second debounce)
- Shows count of broken links
- One-click fix
- Converts links back to plain text
- Preserves note title when removing

**Why it's useful:**
- Keep your knowledge base clean
- Avoid confusion from dead links
- Easy maintenance

### 5. Knowledge Graph Visualization

**Access:** Navigate to `/graph`

**What you see:**

**Statistics Dashboard:**
- Total notes in your knowledge base
- Total connections between notes
- Orphaned notes (not linked to anything)
- Average connections per note

**Interactive Graph:**
- 2D force-directed layout
- Each note is a node
- Lines show connections
- Node size = number of connections
- Color from first tag

**Controls:**
- **Click node** - Navigate to that note
- **Fullscreen button** - Expand view
- **Refresh button** - Reload data
- **Filter toggle** - Show/hide orphaned notes

**Most Connected Notes:**
Below the graph, see your "hub" notes - the most referenced topics.

**Use cases:**
- Find knowledge gaps (sparse areas)
- Identify important concepts (large nodes)
- Discover isolated notes (orphans)
- Understand your knowledge structure

---

## 🧪 User Testing Guide

### Test Scenario 1: Basic Linking (5 min)

**Goal:** Create links between notes

**Steps:**
1. Create 3 notes: "JavaScript Basics", "React Hooks", "useState Hook"
2. In "React Hooks" note, type:
   ```
   React has several hooks like [[useState Hook]]
   ```
3. Verify the link appears as a blue badge
4. Click the link - should navigate to "useState Hook"
5. In "useState Hook", scroll down
6. Verify backlinks shows "React Hooks" links here

**Expected Results:**
- ✅ Autocomplete appeared after typing `[[`
- ✅ Link created successfully
- ✅ Link is clickable
- ✅ Navigation works
- ✅ Backlink shows in "useState Hook"

### Test Scenario 2: Unlinked Mentions (5 min)

**Goal:** Test automatic mention detection

**Steps:**
1. Create note "Redux"
2. Create note "State Management" with content:
   ```
   There are many ways to manage state. Redux is popular.
   Redux helps with complex state. Many developers use Redux.
   ```
3. Don't create any links manually
4. Scroll to "Unlinked Mentions" panel
5. Should show "Redux - 3 mentions"
6. Click "Link All"
7. Verify all 3 "Redux" words became links

**Expected Results:**
- ✅ Unlinked mentions panel appeared
- ✅ Showed correct count (3)
- ✅ "Link All" converted all mentions
- ✅ Existing text wasn't affected
- ✅ Links are clickable

### Test Scenario 3: Hover Previews (3 min)

**Goal:** Test preview functionality

**Steps:**
1. Create note "CSS Flexbox" with some content and a tag
2. In another note, link to it: `[[CSS Flexbox]]`
3. Hover over the link for 1 second
4. Verify preview appears showing:
   - Title "CSS Flexbox"
   - Content preview
   - Tag(s)
   - Last updated time

**Expected Results:**
- ✅ Preview appears after ~0.5 seconds
- ✅ Shows correct content
- ✅ Shows tags
- ✅ Preview disappears when mouse moves away

### Test Scenario 4: Knowledge Graph (5 min)

**Goal:** Visualize note connections

**Prerequisites:** Complete scenarios 1-2 first (have some linked notes)

**Steps:**
1. Navigate to `/graph`
2. Observe the graph visualization
3. Verify statistics show:
   - Correct total note count
   - Correct link count
   - Orphaned count (if any)
4. Click the fullscreen button
5. Click a node in the graph
6. Verify it navigates to that note
7. Look at "Most Connected Notes" section
8. Toggle "Hide Orphaned" filter

**Expected Results:**
- ✅ Graph renders all notes
- ✅ Connections shown as lines
- ✅ Statistics accurate
- ✅ Clicking nodes navigates
- ✅ Fullscreen works
- ✅ Filter toggles orphaned notes

### Test Scenario 5: Broken Links (5 min)

**Goal:** Test broken link detection

**Steps:**
1. Create note "Old Concept"
2. Create note "New Note" linking to: `[[Old Concept]]`
3. Save "New Note"
4. Go back and delete "Old Concept"
5. Open "New Note" again
6. Scroll up - should see red warning banner
7. Click "Remove broken links"
8. Verify link converted to plain text "Old Concept"

**Expected Results:**
- ✅ Warning banner appeared
- ✅ Showed correct count
- ✅ "Remove broken links" worked
- ✅ Text preserved (not deleted)
- ✅ No more broken links warning

### Test Scenario 6: Complex Workflow (10 min)

**Goal:** Test realistic usage

**Steps:**
1. Create a "Course" folder with 5 notes:
   - "Week 1: Introduction"
   - "Week 2: Advanced Topics"
   - "Promises"
   - "Async Await"
   - "Error Handling"

2. In "Week 1", write:
   ```
   This week we covered Promises and Error Handling basics.
   ```

3. In "Week 2", write:
   ```
   Building on Promises, we learned Async Await which makes
   asynchronous code cleaner. Error Handling is crucial.
   ```

4. Don't manually link anything yet

5. Open "Week 1":
   - Check "Unlinked Mentions"
   - Link all "Promises" mentions
   - Link all "Error Handling" mentions

6. Open "Week 2":
   - Use `[[` to manually link to "Async Await"
   - Link remaining mentions via "Link All"

7. Navigate to `/graph`
   - Find "Promises" node
   - Verify it's connected to both Week 1 and Week 2
   - Check it's one of the "Most Connected"

8. Open "Promises" note
   - Verify backlinks show both Week 1 and Week 2

**Expected Results:**
- ✅ Mixed manual/auto linking works
- ✅ Graph shows correct structure
- ✅ Backlinks accurate
- ✅ Most connected list correct

---

## 🔧 Technical Implementation

### Architecture Overview

```
Client Side:
- Tiptap Editor with custom NoteLink extension
- React components for UI (suggestions, previews, panels)
- Auto-save with debouncing

API Layer:
- /api/notes/search - Note title search
- /api/notes/[id] - CRUD with links
- /api/notes/graph - Graph data

Database:
- NoteLink table with bidirectional relations
- Indexed for performance
- Cascade delete for cleanup
```

### Key Files

**Components:**
- `components/editor/editor.tsx` - Main editor with link support
- `components/editor/note-link-suggestion.tsx` - Autocomplete dropdown
- `components/notes/backlinks-panel.tsx` - Backlinks display
- `components/notes/note-link-preview.tsx` - Hover previews
- `components/notes/unlinked-mentions.tsx` - Mention detection
- `components/notes/broken-links-warning.tsx` - Broken link alerts
- `components/graph/knowledge-graph.tsx` - Graph visualization

**Extensions:**
- `lib/tiptap-extensions/note-link.ts` - Custom Tiptap node

**API Routes:**
- `app/api/notes/search/route.ts` - Search endpoint
- `app/api/notes/[id]/route.ts` - Note CRUD with links
- `app/api/notes/graph/route.ts` - Graph data

**Utilities:**
- `lib/note-linking.ts` - Helper functions

### Database Schema

```prisma
model NoteLink {
  id         String   @id @default(uuid())
  fromNoteId String
  toNoteId   String
  createdAt  DateTime @default(now())

  Note_NoteLink_fromNoteIdToNote Note @relation(...)
  Note_NoteLink_toNoteIdToNote   Note @relation(...)

  @@unique([fromNoteId, toNoteId])
  @@index([fromNoteId])
  @@index([toNoteId])
}
```

**Features:**
- Bidirectional tracking
- Cascade delete
- Unique constraint prevents duplicates
- Indexed for fast lookups

### Performance Optimizations

1. **Debouncing:**
   - Auto-save: 2 seconds
   - Unlinked mentions: 1 second
   - Broken links: 2 seconds
   - Preview show: 500ms

2. **Limiting:**
   - Search results: 10 max
   - Unlinked mentions display: 5 max
   - Graph most connected: 10 max

3. **Indexing:**
   - Database indexes on note link fields
   - Unique constraints

4. **Lazy Loading:**
   - Graph: Dynamic import, no SSR
   - Previews: Fetch on demand

### Data Flow

**Creating a Link:**
```
1. User types [[ → Trigger suggestion
2. User types "React" → Search /api/notes/search?q=React
3. User selects → Insert NoteLink node in editor
4. Content changes → Extract note IDs from HTML
5. Auto-save (2s) → PATCH /api/notes/[id] with noteLinks
6. API deletes old links → Creates new NoteLink records
```

**Viewing Backlinks:**
```
1. Open note → GET /api/notes/[id]
2. Prisma includes NoteLink relations
3. Format linked notes and backlinks
4. Render in BacklinksPanel component
```

---

## 🐛 Troubleshooting

### Links Not Showing in Autocomplete

**Symptoms:** Type `[[` but no suggestions appear

**Possible Causes:**
1. No notes exist yet
2. No notes match your search
3. Network error

**Solutions:**
- Create at least one other note first
- Check note titles - search is case-insensitive but must match
- Check browser console for API errors
- Verify you're logged in

### Backlinks Not Appearing

**Symptoms:** Created links but backlinks panel is empty

**Possible Causes:**
1. Links not saved yet
2. Page needs refresh
3. Both notes don't exist

**Solutions:**
- Wait 2 seconds for auto-save
- Check for "Saved" indicator
- Refresh the page
- Verify both notes exist in database

### Preview Not Showing

**Symptoms:** Hover over link but no preview appears

**Possible Causes:**
1. Not hovering long enough
2. Note was deleted
3. JavaScript error

**Solutions:**
- Hover for full 0.5 seconds
- Check if target note still exists
- Check browser console
- Try refreshing page

### Graph Not Loading

**Symptoms:** Navigate to `/graph` but see spinner forever

**Possible Causes:**
1. No notes created
2. API error
3. Browser performance issue

**Solutions:**
- Create at least one note
- Check browser console for errors
- Try refreshing
- Check network tab for failed requests

### Broken Link Warning Won't Dismiss

**Symptoms:** Fixed broken links but warning still shows

**Possible Causes:**
1. Page needs refresh
2. More broken links exist
3. Fix didn't save

**Solutions:**
- Refresh the page
- Check all links in content
- Wait for auto-save (2 seconds)
- Click "Remove broken links" again

### Unlinked Mentions Not Detecting

**Symptoms:** Mentioned a note title but not in unlinked panel

**Possible Causes:**
1. Title too short (< 3 characters)
2. Already linked
3. Case mismatch

**Solutions:**
- Note titles must be 3+ characters
- Check if already a link (look for blue badge)
- Exact title match required
- Wait 1 second for detection

---

## 💡 Best Practices

### 1. Naming Conventions

**Good Note Titles:**
- ✅ "React Hooks useState"
- ✅ "Database Normalization"
- ✅ "CSS Flexbox vs Grid"

**Avoid:**
- ❌ "Notes 1" (too generic)
- ❌ "X" (too short)
- ❌ "asdf" (not descriptive)

### 2. Linking Strategy

**Link Liberally:**
- Don't overthink - create links freely
- More links = richer knowledge graph
- Links help you rediscover connections

**Create Hub Notes:**
- Make overview notes that link to many topics
- Examples: "Week 1 Summary", "JavaScript Concepts"
- These become navigation points

**Review Backlinks Weekly:**
- Check your backlinks to discover patterns
- Find unexpected connections
- Consolidate similar notes

### 3. Graph Maintenance

**Fix Orphans:**
- Use graph to find isolated notes
- Link them to your main knowledge base
- Or delete if not useful

**Check Hub Notes:**
- "Most Connected" shows your important topics
- Ensure these are high-quality notes
- Consider breaking up overly connected notes

**Use Filters:**
- Hide orphans to see core structure
- Show orphans when cleaning up

---

## 🎓 Advanced Use Cases

### Building a Course Knowledge Base

1. Create topic notes for each lesson
2. Create concept notes (detailed)
3. Link topics to concepts
4. Use graph to visualize course structure
5. Backlinks show "where concept is used"

### Research Organization

1. Create source notes ("Paper: Title")
2. Create theme notes ("Privacy", "Security")
3. Link sources to themes
4. Backlinks = "all sources about X"
5. Graph reveals research landscape

### Personal Knowledge Management (PKM)

1. Daily notes with references
2. Evergreen notes (permanent concepts)
3. Link daily → evergreen
4. Backlinks show concept evolution
5. Graph shows knowledge growth

---

## 📊 Feature Checklist

Use this to verify all features work:

### Core Features
- [ ] Create link with `[[` syntax
- [ ] Autocomplete shows matching notes
- [ ] Keyboard navigation (↑/↓/Enter/Esc)
- [ ] Mouse selection works
- [ ] Links save automatically (2s)
- [ ] Links are clickable
- [ ] Clicking navigates to note
- [ ] Backlinks panel shows linked notes
- [ ] Backlinks panel shows backlinks
- [ ] Auto-save indicator appears

### Advanced Features
- [ ] Unlinked mentions detected
- [ ] "Link All" converts mentions
- [ ] Hover preview appears (0.5s delay)
- [ ] Preview shows title, content, tags
- [ ] Broken link warning appears
- [ ] "Remove broken links" works
- [ ] Knowledge graph renders
- [ ] Graph statistics accurate
- [ ] Graph nodes clickable
- [ ] Fullscreen mode works
- [ ] Orphaned filter toggles
- [ ] Most connected list shows

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

2. **Verify Database**
   - Ensure Prisma client generated
   - Check database connection
   - Run `npx prisma studio` to inspect data

3. **Clear Cache**
   - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
   - Clear browser cache
   - Restart dev server

4. **Test in Incognito**
   - Rules out extension conflicts
   - Fresh session

---

## 🎉 You're Ready!

You now have everything you need to:
- ✅ Create wiki-style links
- ✅ Use advanced features
- ✅ Test thoroughly
- ✅ Troubleshoot issues
- ✅ Understand the implementation

**Start Testing:**
Follow the User Testing Guide scenarios above to explore all features systematically!

**Happy Linking!** 🚀

---

**Version:** 2.0
**Last Updated:** December 20, 2025
**Feature Status:** ✅ Production Ready
