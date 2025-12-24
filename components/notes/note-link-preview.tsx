'use client'

import { useState, useEffect } from 'react'
import { FileText, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NoteLinkPreviewProps {
  noteId: string
  position: { x: number; y: number }
  onClose: () => void
}

export function NoteLinkPreview({ noteId, position, onClose }: NoteLinkPreviewProps) {
  const [note, setNote] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}`)
        if (response.ok) {
          const { note } = await response.json()
          setNote(note)
        }
      } catch (error) {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }

    fetchNote()
  }, [noteId])

  const handleMouseEnter = () => {
    // Keep preview open when hovering over it
  }

  const handleMouseLeave = () => {
    onClose()
  }

  // Extract plain text from HTML content
  const getPreviewText = (htmlContent: string, maxLength = 200) => {
    const div = document.createElement('div')
    div.innerHTML = htmlContent
    const text = div.textContent || div.innerText || ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  if (loading) {
    return (
      <div
        className="absolute z-50 p-4 rounded-lg shadow-xl border max-w-sm"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading preview...
        </div>
      </div>
    )
  }

  if (!note) return null

  return (
    <div
      className="absolute z-50 p-4 rounded-lg shadow-xl border max-w-md"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3 mb-3">
        <FileText size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
            {note.title}
          </h4>
          {note.Folder && (
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              in {note.Folder.name}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Calendar size={12} />
            <span>
              Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="text-sm mb-3 line-clamp-4" style={{ color: 'var(--text-secondary)' }}>
        {getPreviewText(note.content)}
      </div>

      {note.Tag && note.Tag.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.Tag.slice(0, 3).map((tag: any) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: tag.color || 'var(--border-light)',
                color: 'var(--text-primary)',
              }}
            >
              {tag.name}
            </span>
          ))}
          {note.Tag.length > 3 && (
            <span className="px-2 py-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              +{note.Tag.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}>
        Click to open • Hover to preview
      </div>
    </div>
  )
}
