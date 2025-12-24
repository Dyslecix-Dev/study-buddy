import { describe, it, expect, beforeEach, vi } from 'vitest'
import { incrementDailyProgress, decrementDailyProgress } from '@/lib/progress-tracker'
import { prisma } from '@/lib/prisma'
import { startOfDay } from 'date-fns'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    dailyProgress: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('Progress Tracker', () => {
  const mockUserId = 'test-user-123'
  const mockDate = new Date('2024-01-15T10:30:00Z')
  const dayStart = startOfDay(mockDate)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('incrementDailyProgress', () => {
    it('should create new progress record for task completion', async () => {
      const mockUpsert = vi.mocked(prisma.dailyProgress.upsert)
      mockUpsert.mockResolvedValue({
        id: 'progress-1',
        userId: mockUserId,
        date: dayStart,
        tasksCompleted: 1,
        cardsReviewed: 0,
        notesCreated: 0,
        notesUpdated: 0,
        focusMinutes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await incrementDailyProgress(mockUserId, 'taskCompleted', mockDate)

      expect(mockUpsert).toHaveBeenCalledWith({
        where: {
          userId_date: {
            userId: mockUserId,
            date: dayStart,
          },
        },
        update: {
          updatedAt: expect.any(Date),
          tasksCompleted: { increment: 1 },
        },
        create: {
          userId: mockUserId,
          date: dayStart,
          tasksCompleted: 1,
          cardsReviewed: 0,
          notesCreated: 0,
          notesUpdated: 0,
          focusMinutes: 0,
        },
      })
    })

    it('should increment existing progress record for card review', async () => {
      const mockUpsert = vi.mocked(prisma.dailyProgress.upsert)
      mockUpsert.mockResolvedValue({
        id: 'progress-1',
        userId: mockUserId,
        date: dayStart,
        tasksCompleted: 0,
        cardsReviewed: 2,
        notesCreated: 0,
        notesUpdated: 0,
        focusMinutes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await incrementDailyProgress(mockUserId, 'cardReviewed', mockDate)

      expect(mockUpsert).toHaveBeenCalledWith({
        where: {
          userId_date: {
            userId: mockUserId,
            date: dayStart,
          },
        },
        update: {
          updatedAt: expect.any(Date),
          cardsReviewed: { increment: 1 },
        },
        create: {
          userId: mockUserId,
          date: dayStart,
          tasksCompleted: 0,
          cardsReviewed: 1,
          notesCreated: 0,
          notesUpdated: 0,
          focusMinutes: 0,
        },
      })
    })

    it('should handle note creation', async () => {
      const mockUpsert = vi.mocked(prisma.dailyProgress.upsert)
      mockUpsert.mockResolvedValue({
        id: 'progress-1',
        userId: mockUserId,
        date: dayStart,
        tasksCompleted: 0,
        cardsReviewed: 0,
        notesCreated: 1,
        notesUpdated: 0,
        focusMinutes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await incrementDailyProgress(mockUserId, 'noteCreated', mockDate)

      expect(mockUpsert).toHaveBeenCalledWith({
        where: {
          userId_date: {
            userId: mockUserId,
            date: dayStart,
          },
        },
        update: {
          updatedAt: expect.any(Date),
          notesCreated: { increment: 1 },
        },
        create: {
          userId: mockUserId,
          date: dayStart,
          tasksCompleted: 0,
          cardsReviewed: 0,
          notesCreated: 1,
          notesUpdated: 0,
          focusMinutes: 0,
        },
      })
    })

    it('should handle note update', async () => {
      const mockUpsert = vi.mocked(prisma.dailyProgress.upsert)
      mockUpsert.mockResolvedValue({
        id: 'progress-1',
        userId: mockUserId,
        date: dayStart,
        tasksCompleted: 0,
        cardsReviewed: 0,
        notesCreated: 0,
        notesUpdated: 1,
        focusMinutes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await incrementDailyProgress(mockUserId, 'noteUpdated', mockDate)

      expect(mockUpsert).toHaveBeenCalledWith({
        where: {
          userId_date: {
            userId: mockUserId,
            date: dayStart,
          },
        },
        update: {
          updatedAt: expect.any(Date),
          notesUpdated: { increment: 1 },
        },
        create: {
          userId: mockUserId,
          date: dayStart,
          tasksCompleted: 0,
          cardsReviewed: 0,
          notesCreated: 0,
          notesUpdated: 1,
          focusMinutes: 0,
        },
      })
    })

    it('should not throw error if database operation fails', async () => {
      const mockUpsert = vi.mocked(prisma.dailyProgress.upsert)
      mockUpsert.mockRejectedValue(new Error('Database error'))

      // Should not throw
      await expect(incrementDailyProgress(mockUserId, 'taskCompleted', mockDate)).resolves.not.toThrow()
    })
  })

  describe('decrementDailyProgress', () => {
    it('should decrement task count when uncompleting task', async () => {
      const mockFindUnique = vi.mocked(prisma.dailyProgress.findUnique)
      const mockUpdate = vi.mocked(prisma.dailyProgress.update)

      mockFindUnique.mockResolvedValue({
        id: 'progress-1',
        userId: mockUserId,
        date: dayStart,
        tasksCompleted: 5,
        cardsReviewed: 0,
        notesCreated: 0,
        notesUpdated: 0,
        focusMinutes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockUpdate.mockResolvedValue({
        id: 'progress-1',
        userId: mockUserId,
        date: dayStart,
        tasksCompleted: 4,
        cardsReviewed: 0,
        notesCreated: 0,
        notesUpdated: 0,
        focusMinutes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await decrementDailyProgress(mockUserId, 'taskCompleted', mockDate)

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          userId_date: {
            userId: mockUserId,
            date: dayStart,
          },
        },
        data: {
          updatedAt: expect.any(Date),
          tasksCompleted: { decrement: 1 },
        },
      })
    })

    it('should not decrement below zero', async () => {
      const mockFindUnique = vi.mocked(prisma.dailyProgress.findUnique)
      const mockUpdate = vi.mocked(prisma.dailyProgress.update)

      mockFindUnique.mockResolvedValue({
        id: 'progress-1',
        userId: mockUserId,
        date: dayStart,
        tasksCompleted: 0,
        cardsReviewed: 0,
        notesCreated: 0,
        notesUpdated: 0,
        focusMinutes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await decrementDailyProgress(mockUserId, 'taskCompleted', mockDate)

      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should handle non-existent progress record gracefully', async () => {
      const mockFindUnique = vi.mocked(prisma.dailyProgress.findUnique)
      mockFindUnique.mockResolvedValue(null)

      await expect(decrementDailyProgress(mockUserId, 'taskCompleted', mockDate)).resolves.not.toThrow()
    })

    it('should not throw error if database operation fails', async () => {
      const mockFindUnique = vi.mocked(prisma.dailyProgress.findUnique)
      mockFindUnique.mockRejectedValue(new Error('Database error'))

      await expect(decrementDailyProgress(mockUserId, 'taskCompleted', mockDate)).resolves.not.toThrow()
    })
  })
})
