import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareModal from '@/components/share/share-modal'
import { toast } from 'sonner'

// Mock fetch
global.fetch = vi.fn()

describe('ShareModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)
  })

  it('should render the modal when open', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        contentType="folder"
        contentId="test-folder-1"
        contentName="My Test Folder"
        itemCount={5}
      />
    )

    expect(screen.getByText(/Share My Test Folder/i)).toBeInTheDocument()
    expect(screen.getByText(/5 notes/i)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    const { container } = render(
      <ShareModal
        isOpen={false}
        onClose={() => {}}
        contentType="folder"
        contentId="test-folder-1"
        contentName="My Test Folder"
        itemCount={5}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should display correct item count for decks', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        contentType="deck"
        contentId="test-deck-1"
        contentName="Spanish Vocabulary"
        itemCount={20}
      />
    )

    expect(screen.getByText(/20 flashcards/i)).toBeInTheDocument()
  })

  it('should display correct item count for exams', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        contentType="exam"
        contentId="test-exam-1"
        contentName="Midterm Exam"
        itemCount={10}
      />
    )

    expect(screen.getByText(/10 questions/i)).toBeInTheDocument()
  })

  it('should validate email input', async () => {
    const user = userEvent.setup()

    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        contentType="folder"
        contentId="test-folder-1"
        contentName="My Test Folder"
        itemCount={5}
      />
    )

    const emailInput = screen.getByPlaceholderText(/email address/i)
    await user.type(emailInput, 'invalid-email')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Should show validation error for invalid email
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('valid email'))
    })
  })

  it('should accept valid email and proceed to confirmation', async () => {
    const user = userEvent.setup()

    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        contentType="folder"
        contentId="test-folder-1"
        contentName="My Test Folder"
        itemCount={5}
      />
    )

    const emailInput = screen.getByPlaceholderText(/email address/i)
    await user.type(emailInput, 'recipient@example.com')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Should proceed to confirmation step
    await waitFor(() => {
      expect(screen.getByText(/confirm share/i)).toBeInTheDocument()
      expect(screen.getByText(/recipient@example.com/i)).toBeInTheDocument()
    })
  })

  it('should support multiple recipients', async () => {
    const user = userEvent.setup()

    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        contentType="folder"
        contentId="test-folder-1"
        contentName="My Test Folder"
        itemCount={5}
      />
    )

    const emailInput = screen.getByPlaceholderText(/email address/i)
    await user.type(emailInput, 'user1@example.com')

    // Look for add recipient button
    const addButton = screen.getByRole('button', { name: /add recipient/i })
    await user.click(addButton)

    // Should show second email input
    const emailInputs = screen.getAllByPlaceholderText(/email address/i)
    expect(emailInputs).toHaveLength(2)

    await user.type(emailInputs[1], 'user2@example.com')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Should show both recipients in confirmation
    await waitFor(() => {
      expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument()
      expect(screen.getByText(/user2@example.com/i)).toBeInTheDocument()
    })
  })

  it('should send share request on confirmation', async () => {
    const user = userEvent.setup()
    const onCloseMock = vi.fn()

    render(
      <ShareModal
        isOpen={true}
        onClose={onCloseMock}
        contentType="folder"
        contentId="test-folder-1"
        contentName="My Test Folder"
        itemCount={5}
      />
    )

    const emailInput = screen.getByPlaceholderText(/email address/i)
    await user.type(emailInput, 'recipient@example.com')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/confirm/i)).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /confirm.*share/i })
    await user.click(confirmButton)

    // Should call API with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/share',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('recipient@example.com'),
        })
      )
    })

    // Should show success message
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
    })

    // Should close modal
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled()
    })
  })

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup()

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'User not found' }),
    } as Response)

    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        contentType="folder"
        contentId="test-folder-1"
        contentName="My Test Folder"
        itemCount={5}
      />
    )

    const emailInput = screen.getByPlaceholderText(/email address/i)
    await user.type(emailInput, 'nonexistent@example.com')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    const confirmButton = screen.getByRole('button', { name: /confirm.*share/i })
    await user.click(confirmButton)

    // Should show error message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('User not found'))
    })
  })

  it('should allow going back from confirmation', async () => {
    const user = userEvent.setup()

    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        contentType="folder"
        contentId="test-folder-1"
        contentName="My Test Folder"
        itemCount={5}
      />
    )

    const emailInput = screen.getByPlaceholderText(/email address/i)
    await user.type(emailInput, 'recipient@example.com')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/confirm/i)).toBeInTheDocument()
    })

    const backButton = screen.getByRole('button', { name: /back/i })
    await user.click(backButton)

    // Should go back to email input step
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument()
    })
  })

  it('should call onClose when cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCloseMock = vi.fn()

    render(
      <ShareModal
        isOpen={true}
        onClose={onCloseMock}
        contentType="folder"
        contentId="test-folder-1"
        contentName="My Test Folder"
        itemCount={5}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(onCloseMock).toHaveBeenCalled()
  })
})
