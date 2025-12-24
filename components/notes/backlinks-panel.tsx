'use client'

import { useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

interface BacklinkNote {
  id: string
  title: string
}

interface BacklinksPanelProps {
  backlinks: BacklinkNote[]
  linkedNotes: BacklinkNote[]
  folderId?: string
}

export function BacklinksPanel({ backlinks, linkedNotes, folderId }: BacklinksPanelProps) {
  const router = useRouter()

  const handleNoteClick = (noteId: string) => {
    if (folderId) {
      router.push(`/notes/${folderId}/edit/${noteId}`)
    } else {
      // Try to navigate to the note - we might need to fetch its folder
      router.push(`/notes/all/edit/${noteId}`)
    }
  }

  if (backlinks.length === 0 && linkedNotes.length === 0) {
    return null
  }

  return (
    <div className="mt-8 space-y-6">
      {linkedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Linked Notes ({linkedNotes.length})
          </h3>
          <div className="space-y-2">
            {linkedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors border"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-bg)'
                }}
              >
                <ExternalLink size={16} />
                <span className="text-sm">{note.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {backlinks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Backlinks ({backlinks.length})
          </h3>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Notes that link to this page
          </p>
          <div className="space-y-2">
            {backlinks.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors border"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-bg)'
                }}
              >
                <ExternalLink size={16} />
                <span className="text-sm">{note.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
