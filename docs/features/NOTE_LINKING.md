# Note Linking System

Wiki-style bidirectional linking between notes.

## Quick Start

### Creating Links

In the note editor, use `[[Note Title]]` syntax:

```markdown
See [[Calculus Fundamentals]] for basics.
Related to [[Linear Algebra]] and [[Physics Notes]].
```

The system will:
- Autocomplete note titles as you type
- Create clickable links
- Track backlinks automatically

### Viewing Backlinks

Each note shows:
- **Outgoing links** - Notes this note links to
- **Backlinks** - Notes that link to this note
- **Unlinked mentions** - Notes that mention the title but don't link

## Implementation

### Database Schema

```prisma
model Note {
  id         String     @id
  title      String
  // ...
  linksTo    NoteLink[] @relation("NoteLink_fromNoteIdToNote")
  linkedFrom NoteLink[] @relation("NoteLink_toNoteIdToNote")
}

model NoteLink {
  id         String @id
  fromNoteId String
  toNoteId   String
  fromNote   Note   @relation("NoteLink_fromNoteIdToNote", ...)
  toNote     Note   @relation("NoteLink_toNoteIdToNote", ...)

  @@unique([fromNoteId, toNoteId])
}
```

### Tiptap Extension

The custom `NoteLink` extension handles:
- Parsing `[[title]]` syntax
- Rendering as clickable links
- Autocomplete suggestions
- Link validation

### API Endpoints

**GET `/api/notes/:id/links`** - Get links and backlinks

**POST `/api/notes/:id/links`** - Create link

**DELETE `/api/notes/:id/links/:linkId`** - Remove link

## Usage Example

```typescript
// In note editor
import { NoteLink } from "@/lib/tiptap-extensions";

const editor = useEditor({
  extensions: [
    StarterKit,
    NoteLink, // Add note linking
  ],
});

// Parse [[Note Title]] syntax
// Extension automatically:
// 1. Shows autocomplete dropdown
// 2. Creates link when note exists
// 3. Shows warning if note doesn't exist
```

## Backlinks Panel

```tsx
import { useEffect, useState } from "react";

export function BacklinksPanel({ noteId }: { noteId: string }) {
  const [links, setLinks] = useState({ outgoing: [], incoming: [] });

  useEffect(() => {
    fetch(`/api/notes/${noteId}/links`)
      .then(res => res.json())
      .then(setLinks);
  }, [noteId]);

  return (
    <div>
      <h3>Links ({links.outgoing.length})</h3>
      {links.outgoing.map(link => (
        <a key={link.id} href={`/notes/${link.toNoteId}`}>
          {link.toNote.title}
        </a>
      ))}

      <h3>Backlinks ({links.incoming.length})</h3>
      {links.incoming.map(link => (
        <a key={link.id} href={`/notes/${link.fromNoteId}`}>
          {link.fromNote.title}
        </a>
      ))}
    </div>
  );
}
```

## Knowledge Graph

Visualize note connections using `react-force-graph-2d`:

```tsx
import ForceGraph2D from "react-force-graph-2d";

export function KnowledgeGraph({ notes }: { notes: Note[] }) {
  const graphData = {
    nodes: notes.map(note => ({
      id: note.id,
      name: note.title,
      val: note.linksTo.length + 1,
    })),
    links: notes.flatMap(note =>
      note.linksTo.map(link => ({
        source: note.id,
        target: link.toNoteId,
      }))
    ),
  };

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="name"
      onNodeClick={(node) => router.push(`/notes/${node.id}`)}
    />
  );
}
```

Access at `/graph` route.

## Features

- ✅ Bidirectional linking
- ✅ Autocomplete while typing
- ✅ Backlinks panel
- ✅ Unlinked mentions detection
- ✅ Visual knowledge graph
- ✅ Link count tracking
- ✅ Dead link detection

## Related Files

- `lib/tiptap-extensions/note-link.ts` - Tiptap extension
- `lib/note-linking.ts` - Helper functions
- `components/notes/backlinks-panel.tsx` - UI component
- `components/graph/knowledge-graph.tsx` - Graph visualization
- `app/api/notes/[id]/links/route.ts` - API endpoints

**Last Updated:** December 2024
