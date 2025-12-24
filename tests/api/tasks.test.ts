import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST, PATCH, DELETE } from '@/app/api/tasks/[id]/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { incrementDailyProgress, decrementDailyProgress } from '@/lib/progress-tracker'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    tag: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })),
    },
  })),
}))

vi.mock('@/lib/progress-tracker', () => ({
  incrementDailyProgress: vi.fn(),
  decrementDailyProgress: vi.fn(),
}))

describe('Tasks API Routes', () => {
  const mockTaskId = 'task-123'
  const mockUserId = 'test-user-id'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/tasks/[id]', () => {
    it('should return task for authenticated user', async () => {
      const mockTask = {
        id: mockTaskId,
        title: 'Test Task',
        description: 'Test description',
        completed: false,
        dueDate: new Date(),
        startTime: null,
        endTime: null,
        priority: 1,
        order: 0,
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        Tag: [],
      }

      vi.mocked(prisma.task.findFirst).mockResolvedValue(mockTask)

      const request = new NextRequest(`http://localhost:3000/api/tasks/${mockTaskId}`)
      const params = Promise.resolve({ id: mockTaskId })
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe(mockTaskId)
      expect(data.title).toBe('Test Task')
    })

    it('should return 404 if task not found', async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValue(null)

      const request = new NextRequest(`http://localhost:3000/api/tasks/${mockTaskId}`)
      const params = Promise.resolve({ id: mockTaskId })
      const response = await GET(request, { params })

      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /api/tasks/[id]', () => {
    it('should update task and track progress when completing', async () => {
      const existingTask = {
        id: mockTaskId,
        title: 'Test Task',
        completed: false,
        userId: mockUserId,
        updatedAt: new Date(),
      }

      const updatedTask = {
        ...existingTask,
        completed: true,
        Tag: [],
      }

      vi.mocked(prisma.task.findFirst).mockResolvedValue(existingTask as any)
      vi.mocked(prisma.task.update).mockResolvedValue(updatedTask as any)

      const request = new NextRequest(`http://localhost:3000/api/tasks/${mockTaskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: true }),
      })
      const params = Promise.resolve({ id: mockTaskId })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.completed).toBe(true)
      expect(incrementDailyProgress).toHaveBeenCalledWith(mockUserId, 'taskCompleted')
    })

    it('should decrement progress when uncompleting task', async () => {
      const existingTask = {
        id: mockTaskId,
        title: 'Test Task',
        completed: true,
        userId: mockUserId,
        updatedAt: new Date('2024-01-15'),
      }

      const updatedTask = {
        ...existingTask,
        completed: false,
        Tag: [],
      }

      vi.mocked(prisma.task.findFirst).mockResolvedValue(existingTask as any)
      vi.mocked(prisma.task.update).mockResolvedValue(updatedTask as any)

      const request = new NextRequest(`http://localhost:3000/api/tasks/${mockTaskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: false }),
      })
      const params = Promise.resolve({ id: mockTaskId })
      const response = await PATCH(request, { params })

      expect(response.status).toBe(200)
      expect(decrementDailyProgress).toHaveBeenCalledWith(
        mockUserId,
        'taskCompleted',
        existingTask.updatedAt
      )
    })

    it('should update task without affecting progress when not changing completion', async () => {
      const existingTask = {
        id: mockTaskId,
        title: 'Old Title',
        completed: false,
        userId: mockUserId,
        updatedAt: new Date(),
      }

      const updatedTask = {
        ...existingTask,
        title: 'New Title',
        Tag: [],
      }

      vi.mocked(prisma.task.findFirst).mockResolvedValue(existingTask as any)
      vi.mocked(prisma.task.update).mockResolvedValue(updatedTask as any)

      const request = new NextRequest(`http://localhost:3000/api/tasks/${mockTaskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: 'New Title' }),
      })
      const params = Promise.resolve({ id: mockTaskId })
      const response = await PATCH(request, { params })

      expect(response.status).toBe(200)
      expect(incrementDailyProgress).not.toHaveBeenCalled()
      expect(decrementDailyProgress).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/tasks/[id]', () => {
    it('should delete task without affecting progress stats', async () => {
      const existingTask = {
        id: mockTaskId,
        title: 'Test Task',
        completed: true,
        userId: mockUserId,
      }

      vi.mocked(prisma.task.findFirst).mockResolvedValue(existingTask as any)
      vi.mocked(prisma.task.findUnique).mockResolvedValue({ Tag: [] } as any)
      vi.mocked(prisma.task.delete).mockResolvedValue(existingTask as any)

      const request = new NextRequest(`http://localhost:3000/api/tasks/${mockTaskId}`)
      const params = Promise.resolve({ id: mockTaskId })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Progress should NOT be decremented when deleting
      expect(decrementDailyProgress).not.toHaveBeenCalled()
    })

    it('should return 404 if task not found', async () => {
      vi.mocked(prisma.task.findFirst).mockResolvedValue(null)

      const request = new NextRequest(`http://localhost:3000/api/tasks/${mockTaskId}`)
      const params = Promise.resolve({ id: mockTaskId })
      const response = await DELETE(request, { params })

      expect(response.status).toBe(404)
    })
  })
})
