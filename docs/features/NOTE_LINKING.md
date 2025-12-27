# Note Linking

Wiki-style bidirectional linking.

## Usage

Use `[[Note Title]]` in editor. System auto-completes, creates clickable links, tracks backlinks.

## Features

- Outgoing links, backlinks, unlinked mentions
- Knowledge graph visualization

## Schema

```prisma
model Note {
  linksTo    NoteLink[] @relation("fromNote")
  linkedFrom NoteLink[] @relation("toNote")
}

model NoteLink {
  fromNoteId String
  toNoteId   String
  @@unique([fromNoteId, toNoteId])
}
```

## API

- `GET /api/notes/:id/links` - Get links and backlinks
- `POST /api/notes/:id/links` - Create link
- `DELETE /api/notes/:id/links/:linkId` - Remove link

## Implementation

**Tiptap Extension:**
```tsx
import { NoteLink } from "@/lib/tiptap-extensions";

const editor = useEditor({
  extensions: [StarterKit, NoteLink],
});
```

**Backlinks Panel:**
```tsx
export function BacklinksPanel({ noteId }) {
  const [links, setLinks] = useState({ outgoing: [], incoming: [] });
  
  useEffect(() => {
    fetch(`/api/notes/${noteId}/links`).then(res => res.json()).then(setLinks);
  }, [noteId]);
  
  return (
    <div>
      <h3>Links ({links.outgoing.length})</h3>
      {links.outgoing.map(link => <a href={`/notes/${link.toNoteId}`}>{link.toNote.title}</a>)}
      
      <h3>Backlinks ({links.incoming.length})</h3>
      {links.incoming.map(link => <a href={`/notes/${link.fromNoteId}`}>{link.fromNote.title}</a>)}
    </div>
  );
}
```

**Knowledge Graph:**
```tsx
import ForceGraph2D from "react-force-graph-2d";

export function KnowledgeGraph({ notes }) {
  const graphData = {
    nodes: notes.map(note => ({ id: note.id, name: note.title })),
    links: notes.flatMap(note => note.linksTo.map(link => ({ source: note.id, target: link.toNoteId })))
  };
  return <ForceGraph2D graphData={graphData} onNodeClick={(node) => router.push(`/notes/${node.id}`)} />;
}
```

## Files

- `lib/tiptap-extensions/note-link.ts`
- `components/notes/backlinks-panel.tsx`
- `app/api/notes/[id]/links/route.ts`
