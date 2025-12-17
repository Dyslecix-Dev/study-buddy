'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Editor from '@/components/editor/editor'
import { ArrowLeft, Trash2, Check } from 'lucide-react'

export default function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('<p></p>')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Fetch note on mount
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch note')
        }
        const { note } = await response.json()
        setTitle(note.title)
        setContent(note.content)
      } catch (err: any) {
        setError(err.message || 'Failed to load note')
      } finally {
        setLoading(false)
      }
    }

    fetchNote()
  }, [id])

  // Auto-save with debounce
  useEffect(() => {
    if (loading || saved) return

    const timeoutId = setTimeout(async () => {
      setSaving(true)
      try {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        })

        if (!response.ok) {
          throw new Error('Failed to save note')
        }

        setSaved(true)
      } catch (err: any) {
        setError(err.message || 'Failed to auto-save')
      } finally {
        setSaving(false)
      }
    }, 2000) // Auto-save after 2 seconds of no changes

    return () => clearTimeout(timeoutId)
  }, [title, content, id, loading, saved])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    setSaved(false)
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setSaved(false)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      router.push('/notes')
    } catch (err: any) {
      setError(err.message || 'Failed to delete note')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/notes"
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Notes
              </Link>
              <div className="flex items-center text-sm text-gray-500">
                {saving && 'Saving...'}
                {!saving && saved && (
                  <span className="flex items-center text-green-600">
                    <Check size={16} className="mr-1" />
                    Saved
                  </span>
                )}
                {!saving && !saved && 'Unsaved changes'}
              </div>
            </div>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 flex items-center text-sm"
            >
              <Trash2 size={18} className="mr-1" />
              Delete
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent placeholder-gray-400 text-gray-900"
          />
        </div>

        <Editor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your note..."
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Note?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
