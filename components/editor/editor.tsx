'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import EditorToolbar from './toolbar'
import { NoteLink } from '@/lib/tiptap-extensions/note-link'
import { NoteLinkSuggestion, Note } from './note-link-suggestion'
import { NoteLinkPreview } from '@/components/notes/note-link-preview'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  onNoteLinksChange?: (noteIds: string[]) => void
  onNoteLinkClick?: (noteId: string, noteTitle: string) => void
  placeholder?: string
  editable?: boolean
  currentNoteId?: string
}

export default function Editor({ content, onChange, onNoteLinksChange, onNoteLinkClick, placeholder = 'Start writing...', editable = true, currentNoteId }: EditorProps) {
  const router = useRouter()
  const [suggestionQuery, setSuggestionQuery] = useState<string>('')
  const [suggestionPosition, setSuggestionPosition] = useState<{ top: number; left: number } | null>(null)
  const [suggestionRange, setSuggestionRange] = useState<{ from: number; to: number } | null>(null)
  const [previewNoteId, setPreviewNoteId] = useState<string | null>(null)
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleNoteLinkClick = useCallback((noteId: string, noteTitle: string) => {
    if (onNoteLinkClick) {
      onNoteLinkClick(noteId, noteTitle)
    }
  }, [onNoteLinkClick])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      NoteLink.configure({
        HTMLAttributes: {
          class: 'note-link bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors',
        },
        onNoteLinkClick: handleNoteLinkClick,
      }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert mx-auto focus:outline-none min-h-[300px] p-4 text-gray-900 dark:text-gray-100',
      },
      handleKeyDown: (view, event) => {
        // Detect [[ typing for note link suggestion
        if (event.key === '[') {
          const { state } = view
          const { selection } = state
          const { $from } = selection
          const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')

          if (textBefore.endsWith('[')) {
            // User just typed the second [, trigger suggestion
            setTimeout(() => {
              const coords = view.coordsAtPos($from.pos + 1)
              setSuggestionPosition({ top: coords.bottom + 5, left: coords.left })
              setSuggestionQuery('')
              // Include both [[ in the range (current pos will be after the second [)
              setSuggestionRange({ from: $from.pos - 1, to: $from.pos + 1 })
            }, 10)
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)

      // Extract note links and notify parent
      if (onNoteLinksChange) {
        const noteLinks: string[] = []
        editor.state.doc.descendants(node => {
          if (node.type.name === 'noteLink' && node.attrs.noteId) {
            noteLinks.push(node.attrs.noteId)
          }
        })
        onNoteLinksChange(noteLinks)
      }

      // Update suggestion query if user is typing
      const { selection } = editor.state
      const { $from } = selection
      const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')
      const match = textBefore.match(/\[\[([^\]]*?)$/)

      if (match) {
        setSuggestionQuery(match[1])
        const coords = editor.view.coordsAtPos($from.pos)
        setSuggestionPosition({ top: coords.bottom + 5, left: coords.left })
        setSuggestionRange({ from: $from.pos - match[1].length - 2, to: $from.pos })
      } else if (suggestionPosition) {
        setSuggestionPosition(null)
        setSuggestionQuery('')
        setSuggestionRange(null)
      }
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const handleSuggestionSelect = useCallback((note: Note) => {
    if (!editor || !suggestionRange) return

    // Delete the [[ query ]] text
    editor.chain()
      .focus()
      .deleteRange({ from: suggestionRange.from, to: suggestionRange.to })
      .setNoteLink({ noteId: note.id, noteTitle: note.title })
      .insertContent(' ')
      .run()

    // Close suggestion
    setSuggestionPosition(null)
    setSuggestionQuery('')
    setSuggestionRange(null)
  }, [editor, suggestionRange])

  const handleSuggestionClose = useCallback(() => {
    setSuggestionPosition(null)
    setSuggestionQuery('')
    setSuggestionRange(null)
  }, [])

  // Handle link preview on hover
  useEffect(() => {
    if (!editor) return

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.getAttribute('data-type') === 'note-link') {
        const noteId = target.getAttribute('data-note-id')
        if (noteId) {
          // Clear any existing close timeout
          if (previewTimeoutRef.current) {
            clearTimeout(previewTimeoutRef.current)
            previewTimeoutRef.current = null
          }

          // Clear any existing hover timeout
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
          }

          // Set a delay before showing preview
          hoverTimeoutRef.current = setTimeout(() => {
            const rect = target.getBoundingClientRect()
            setPreviewNoteId(noteId)
            // Position preview to the left of the link, overlapping the editor
            setPreviewPosition({
              x: rect.left - 200, // Position closer to the link, overlapping editor
              y: rect.top - 20, // Slight vertical offset for better alignment
            })
          }, 500) // 500ms delay before showing preview
        }
      }
    }

    const handleMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.getAttribute('data-type') === 'note-link') {
        // Clear hover timeout
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current)
          hoverTimeoutRef.current = null
        }

        // Set a longer delay before hiding preview (allows moving mouse to preview)
        previewTimeoutRef.current = setTimeout(() => {
          setPreviewNoteId(null)
          setPreviewPosition(null)
        }, 300)
      }
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('mouseover', handleMouseOver)
    editorElement.addEventListener('mouseout', handleMouseOut)

    return () => {
      editorElement.removeEventListener('mouseover', handleMouseOver)
      editorElement.removeEventListener('mouseout', handleMouseOut)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
      }
    }
  }, [editor])

  const handlePreviewClose = useCallback(() => {
    setPreviewNoteId(null)
    setPreviewPosition(null)
  }, [])

  if (!editor) {
    return null
  }

  return (
    <div className="relative">
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        {editable && <EditorToolbar editor={editor} />}
        <div style={{ color: 'var(--text-primary)' }}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {editable && (
        <NoteLinkSuggestion
          editor={editor}
          query={suggestionQuery}
          position={suggestionPosition}
          onSelect={handleSuggestionSelect}
          onClose={handleSuggestionClose}
          currentNoteId={currentNoteId}
        />
      )}

      {previewNoteId && previewPosition && (
        <NoteLinkPreview
          noteId={previewNoteId}
          position={previewPosition}
          onClose={handlePreviewClose}
        />
      )}
    </div>
  )
}
