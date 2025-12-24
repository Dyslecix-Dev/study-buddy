'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Editor } from '@tiptap/react'

export interface Note {
  id: string
  title: string
}

interface NoteLinkSuggestionProps {
  editor: Editor | null
  query: string
  position: { top: number; left: number } | null
  onSelect: (note: Note) => void
  onClose: () => void
}

export function NoteLinkSuggestion({ editor, query, position, onSelect, onClose }: NoteLinkSuggestionProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch matching notes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!query && query !== '') return

      setLoading(true)
      try {
        const response = await fetch(`/api/notes/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const { notes } = await response.json()
          setNotes(notes)
          setSelectedIndex(0)
        }
      } catch (error) {
        console.error('Error fetching notes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [query])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!position) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex(prev => (prev + 1) % notes.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex(prev => (prev - 1 + notes.length) % notes.length)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        if (notes[selectedIndex]) {
          onSelect(notes[selectedIndex])
        }
      } else if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [position, notes, selectedIndex, onSelect, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (containerRef.current) {
      const selectedElement = containerRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!position || notes.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 border rounded-lg shadow-lg max-h-60 overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '250px',
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {loading ? (
        <div className="px-4 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : notes.length === 0 ? (
        <div className="px-4 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>No notes found</div>
      ) : (
        notes.map((note, index) => (
          <div
            key={note.id}
            className="px-4 py-2 cursor-pointer text-sm transition-colors"
            style={{
              backgroundColor: index === selectedIndex ? 'var(--surface-hover)' : 'transparent',
              color: index === selectedIndex ? 'var(--primary)' : 'var(--text-primary)',
            }}
            onClick={() => onSelect(note)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            {note.title}
          </div>
        ))
      )}
    </div>
  )
}
