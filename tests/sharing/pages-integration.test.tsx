import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock fetch
global.fetch = vi.fn()

describe('Sharing Integration - Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Notes Page - Folder Sharing', () => {
    it('should open share modal when share button is clicked', async () => {
      const user = userEvent.setup()

      // Mock folders API response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'folder-1',
            name: 'Test Folder',
            description: 'Test Description',
            color: 'blue',
            _count: { notes: 5 },
          },
        ],
      } as Response)

      // Import and render the notes page
      const NotesPage = (await import('@/app/(dashboard)/notes/page')).default
      render(<NotesPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Folder')).toBeInTheDocument()
      })

      // Find and click the share button
      const shareButtons = screen.getAllByTitle(/share/i)
      await user.click(shareButtons[0])

      // Share modal should open
      await waitFor(() => {
        expect(screen.getByText(/Share Test Folder/i)).toBeInTheDocument()
      })
    })

    it('should pass correct props to ShareModal', async () => {
      const user = userEvent.setup()

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'folder-1',
            name: 'My Notes',
            _count: { notes: 10 },
          },
        ],
      } as Response)

      const NotesPage = (await import('@/app/(dashboard)/notes/page')).default
      render(<NotesPage />)

      await waitFor(() => {
        expect(screen.getByText('My Notes')).toBeInTheDocument()
      })

      const shareButton = screen.getAllByTitle(/share/i)[0]
      await user.click(shareButton)

      await waitFor(() => {
        expect(screen.getByText(/10 notes/i)).toBeInTheDocument()
      })
    })
  })

  describe('Flashcards Page - Deck Sharing', () => {
    it('should open share modal when share button is clicked', async () => {
      const user = userEvent.setup()

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'deck-1',
            name: 'Spanish Vocabulary',
            description: 'Common Spanish words',
            _count: { Flashcard: 50 },
          },
        ],
      } as Response)

      const FlashcardsPage = (await import('@/app/(dashboard)/flashcards/page')).default
      render(<FlashcardsPage />)

      await waitFor(() => {
        expect(screen.getByText('Spanish Vocabulary')).toBeInTheDocument()
      })

      const shareButton = screen.getAllByTitle(/share/i)[0]
      await user.click(shareButton)

      await waitFor(() => {
        expect(screen.getByText(/Share Spanish Vocabulary/i)).toBeInTheDocument()
        expect(screen.getByText(/50 flashcards/i)).toBeInTheDocument()
      })
    })
  })

  describe('Exams Page - Exam Sharing', () => {
    it('should display share button on exam cards', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'exam-1',
            name: 'Midterm Exam',
            description: 'Practice questions',
            _count: { Question: 25 },
          },
        ],
      } as Response)

      const ExamsPage = (await import('@/app/(dashboard)/exams/page')).default
      render(<ExamsPage />)

      await waitFor(() => {
        expect(screen.getByText('Midterm Exam')).toBeInTheDocument()
      })

      // Share button should be visible
      const shareButton = screen.getByTitle(/share exam/i)
      expect(shareButton).toBeInTheDocument()
    })

    it('should open share modal with correct exam details', async () => {
      const user = userEvent.setup()

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'exam-1',
            name: 'Final Exam',
            _count: { Question: 15 },
          },
        ],
      } as Response)

      const ExamsPage = (await import('@/app/(dashboard)/exams/page')).default
      render(<ExamsPage />)

      await waitFor(() => {
        expect(screen.getByText('Final Exam')).toBeInTheDocument()
      })

      const shareButton = screen.getByTitle(/share exam/i)
      await user.click(shareButton)

      await waitFor(() => {
        expect(screen.getByText(/Share Final Exam/i)).toBeInTheDocument()
        expect(screen.getByText(/15 questions/i)).toBeInTheDocument()
      })
    })
  })

  describe('Share Modal Close Behavior', () => {
    it('should clear state when modal is closed', async () => {
      const user = userEvent.setup()

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 'folder-1',
            name: 'Test Folder',
            _count: { notes: 3 },
          },
        ],
      } as Response)

      const NotesPage = (await import('@/app/(dashboard)/notes/page')).default
      render(<NotesPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Folder')).toBeInTheDocument()
      })

      // Open modal
      const shareButton = screen.getAllByTitle(/share/i)[0]
      await user.click(shareButton)

      await waitFor(() => {
        expect(screen.getByText(/Share Test Folder/i)).toBeInTheDocument()
      })

      // Close modal
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByText(/Share Test Folder/i)).not.toBeInTheDocument()
      })
    })
  })
})
