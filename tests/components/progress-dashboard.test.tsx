import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ProgressDashboard } from '@/components/dashboard/progress-dashboard'
import userEvent from '@testing-library/user-event'

// Mock fetch
global.fetch = vi.fn()

describe('ProgressDashboard Component', () => {
  const mockStatsData = {
    period: 'week',
    overview: {
      totalNotes: 10,
      totalTasks: 15,
      completedTasks: 8,
      totalFlashcards: 50,
      totalDecks: 3,
      reviewsCount: 25,
      totalFocusMinutes: 120,
      totalStudyMinutes: 180,
      streak: 5,
    },
    activityData: [
      {
        date: 'Dec 18',
        fullDate: '2024-12-18',
        focusMinutes: 30,
        tasksCompleted: 2,
        cardsReviewed: 5,
      },
      {
        date: 'Dec 19',
        fullDate: '2024-12-19',
        focusMinutes: 45,
        tasksCompleted: 3,
        cardsReviewed: 8,
      },
    ],
    recentActivity: [
      {
        id: 'note-1',
        type: 'note',
        title: 'Recent Note',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'task-1',
        type: 'task',
        title: 'Completed Task',
        timestamp: new Date().toISOString(),
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading skeleton initially', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}))

    render(<ProgressDashboard />)

    // Should show loading state
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('should display dashboard statistics after loading', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockStatsData,
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Progress Dashboard')).toBeInTheDocument()
    })

    // Check if stats are displayed
    expect(screen.getByText('120 min')).toBeInTheDocument() // Focus Time
    expect(screen.getByText('8')).toBeInTheDocument() // Tasks Completed
    expect(screen.getByText('25')).toBeInTheDocument() // Cards Reviewed
    expect(screen.getByText('5 days')).toBeInTheDocument() // Streak
  })

  it('should show error message if API call fails', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server error',
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard statistics')).toBeInTheDocument()
    })
  })

  it('should allow switching between time periods', async () => {
    const user = userEvent.setup()
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockStatsData,
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Progress Dashboard')).toBeInTheDocument()
    })

    // Click on "Month" period
    const monthButton = screen.getByText('Month')
    await user.click(monthButton)

    // Should fetch new data for month period
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=month')
      )
    })
  })

  it('should handle zero stats gracefully', async () => {
    const zeroStatsData = {
      ...mockStatsData,
      overview: {
        totalNotes: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalFlashcards: 0,
        totalDecks: 0,
        reviewsCount: 0,
        totalFocusMinutes: 0,
        totalStudyMinutes: 0,
        streak: 0,
      },
      activityData: [],
      recentActivity: [],
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => zeroStatsData,
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Progress Dashboard')).toBeInTheDocument()
    })

    // Should display zeros
    expect(screen.getByText('0 min')).toBeInTheDocument()
    expect(screen.getByText('0 day')).toBeInTheDocument()
  })

  it('should display activity chart metrics selector', async () => {
    const user = userEvent.setup()
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockStatsData,
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Activity Trends')).toBeInTheDocument()
    })

    // Check for metric buttons
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Focus')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Cards')).toBeInTheDocument()

    // Click on Tasks metric
    const tasksButton = screen.getByText('Tasks')
    await user.click(tasksButton)

    // Should update the chart (implementation depends on chart library)
    expect(tasksButton).toBeInTheDocument()
  })

  it('should show streak message', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockStatsData,
        overview: {
          ...mockStatsData.overview,
          streak: 10,
        },
      }),
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Keep it going! 🔥')).toBeInTheDocument()
    })
  })

  it('should show start today message for zero streak', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ...mockStatsData,
        overview: {
          ...mockStatsData.overview,
          streak: 0,
        },
      }),
    } as Response)

    render(<ProgressDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Start today!')).toBeInTheDocument()
    })
  })
})
