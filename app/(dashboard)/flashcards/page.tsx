'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, ArrowLeft } from 'lucide-react'
import DeckList from '@/components/flashcards/deck-list'
import { toast } from 'sonner'
import DeleteConfirmModal from '@/components/ui/delete-confirm-modal'

interface Deck {
  id: string
  name: string
  description: string | null
  color: string | null
  _count: {
    Flashcard: number
  }
  createdAt: Date
  updatedAt: Date
}

export default function FlashcardsPage() {
  const router = useRouter()
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '',
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    fetchDecks()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
    }
  }

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/decks')
      if (response.ok) {
        const data = await response.json()
        setDecks(data)
      }
    } catch (error) {
      console.error('Error fetching decks:', error)
      toast.error('Failed to load decks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Please enter a deck name')
      return
    }

    try {
      console.log('Creating deck with data:', formData)
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        toast.success('Deck created successfully')
        setShowForm(false)
        setFormData({ name: '', description: '', color: '' })
        await fetchDecks()
      } else {
        console.error('Failed to create deck. Status:', response.status, 'Error:', responseData)
        toast.error(responseData.error || 'Failed to create deck')
      }
    } catch (error) {
      console.error('Error creating deck:', error)
      toast.error('Failed to create deck')
    }
  }

  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingDeck) return

    try {
      console.log('Updating deck with ID:', editingDeck.id)
      console.log('Update data:', formData)

      const response = await fetch(`/api/decks/${editingDeck.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        toast.success('Deck updated successfully')
        setEditingDeck(null)
        setFormData({ name: '', description: '', color: '' })
        await fetchDecks()
      } else {
        console.error('Failed to update deck. Status:', response.status, 'Error:', responseData)
        toast.error(responseData.error || 'Failed to update deck')
      }
    } catch (error) {
      console.error('Error updating deck:', error)
      toast.error('Failed to update deck')
    }
  }

  const handleDeleteDeck = async (id: string) => {
    setDeleteConfirm(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/decks/${deleteConfirm}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Deck deleted successfully')
        await fetchDecks()
      } else {
        toast.error('Failed to delete deck')
      }
    } catch (error) {
      console.error('Error deleting deck:', error)
      toast.error('Failed to delete deck')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleEdit = (deck: Deck) => {
    setEditingDeck(deck)
    setFormData({
      name: deck.name,
      description: deck.description || '',
      color: deck.color || '',
    })
    setShowForm(false)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingDeck(null)
    setFormData({ name: '', description: '', color: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading decks...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-xl font-semibold text-gray-900">Flashcards</h2>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Decks</h1>
          <button
            onClick={() => {
              setEditingDeck(null)
              setFormData({ name: '', description: '', color: '' })
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            New Deck
          </button>
        </div>

        {/* Deck Form */}
        {(showForm || editingDeck) && (
          <form
            onSubmit={editingDeck ? handleUpdateDeck : handleCreateDeck}
            className="bg-white rounded-lg shadow p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingDeck ? 'Edit Deck' : 'Create New Deck'}
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Deck Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Spanish Vocabulary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Optional description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Default</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="yellow">Yellow</option>
                  <option value="red">Red</option>
                  <option value="pink">Pink</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {editingDeck ? 'Save Changes' : 'Create Deck'}
                </button>
              </div>
            </div>
          </form>
        )}

        <DeckList decks={decks} onEdit={handleEdit} onDelete={handleDeleteDeck} />
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Deck?"
        description="Are you sure you want to delete this deck? All flashcards will be deleted."
      />
    </div>
  )
}
