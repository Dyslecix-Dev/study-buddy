import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/notes/route'
import { PATCH } from '@/app/api/notes/[id]/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { incrementDailyProgress } from '@/lib/progress-tracker'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    note: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    noteLink: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
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
}))

describe('Notes API Routes', () => {
  const mockUserId = 'test-user-id'
  const mockNoteId = 'note-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/notes', () => {
    it('should create note and track progress', async () => {
      const mockNote = {
        id: mockNoteId,
        title: 'Test Note',
        content: '<p>Test content</p>',
        userId: mockUserId,
        folderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        Tag: [],
      }

      vi.mocked(prisma.note.create).mockResolvedValue(mockNote as any)

      const request = new NextRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Note',
          content: '<p>Test content</p>',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.note.title).toBe('Test Note')
      expect(incrementDailyProgress).toHaveBeenCalledWith(mockUserId, 'noteCreated')
    })

    it('should create note with folder and tags', async () => {
      const mockNote = {
        id: mockNoteId,
        title: 'Test Note',
        content: '<p>Test content</p>',
        userId: mockUserId,
        folderId: 'folder-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        Tag: [{ id: 'tag-1', name: 'Important' }],
      }

      vi.mocked(prisma.note.create).mockResolvedValue(mockNote as any)

      const request = new NextRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Note',
          content: '<p>Test content</p>',
          folderId: 'folder-123',
          tagIds: ['tag-1'],
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(incrementDailyProgress).toHaveBeenCalledWith(mockUserId, 'noteCreated')
    })

    it('should return 400 if title is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          content: '<p>Test content</p>',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(incrementDailyProgress).not.toHaveBeenCalled()
    })

    it('should handle duplicate title error', async () => {
      const mockError = new Error('Unique constraint failed')
      ;(mockError as any).code = 'P2002'

      vi.mocked(prisma.note.create).mockRejectedValue(mockError)

      const request = new NextRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Duplicate Note',
          content: '<p>Test content</p>',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(409)
      // Progress should not be tracked if creation failed
      expect(incrementDailyProgress).not.toHaveBeenCalled()
    })
  })

  describe('PATCH /api/notes/[id]', () => {
    it('should update note and track progress', async () => {
      const existingNote = {
        id: mockNoteId,
        title: 'Old Title',
        content: '<p>Old content</p>',
        userId: mockUserId,
      }

      const updatedNote = {
        ...existingNote,
        title: 'New Title',
        content: '<p>New content</p>',
        Tag: [],
        NoteLink_NoteLink_fromNoteIdToNote: [],
        NoteLink_NoteLink_toNoteIdToNote: [],
      }

      vi.mocked(prisma.note.findFirst).mockResolvedValue(existingNote as any)
      vi.mocked(prisma.note.update).mockResolvedValue(updatedNote as any)

      const request = new NextRequest(`http://localhost:3000/api/notes/${mockNoteId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'New Title',
          content: '<p>New content</p>',
        }),
      })

      const params = Promise.resolve({ id: mockNoteId })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.note.title).toBe('New Title')
      expect(incrementDailyProgress).toHaveBeenCalledWith(mockUserId, 'noteUpdated')
    })

    it('should update note with new tags', async () => {
      const existingNote = {
        id: mockNoteId,
        title: 'Test Note',
        userId: mockUserId,
      }

      const updatedNote = {
        ...existingNote,
        Tag: [{ id: 'tag-1', name: 'Updated' }],
        NoteLink_NoteLink_fromNoteIdToNote: [],
        NoteLink_NoteLink_toNoteIdToNote: [],
      }

      vi.mocked(prisma.note.findFirst).mockResolvedValue(existingNote as any)
      vi.mocked(prisma.note.findUnique).mockResolvedValue({ Tag: [] } as any)
      vi.mocked(prisma.note.update).mockResolvedValue(updatedNote as any)

      const request = new NextRequest(`http://localhost:3000/api/notes/${mockNoteId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          tagIds: ['tag-1'],
        }),
      })

      const params = Promise.resolve({ id: mockNoteId })
      const response = await PATCH(request, { params })

      expect(response.status).toBe(200)
      expect(incrementDailyProgress).toHaveBeenCalledWith(mockUserId, 'noteUpdated')
    })

    it('should return 404 if note not found', async () => {
      vi.mocked(prisma.note.findFirst).mockResolvedValue(null)

      const request = new NextRequest(`http://localhost:3000/api/notes/${mockNoteId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'New Title',
        }),
      })

      const params = Promise.resolve({ id: mockNoteId })
      const response = await PATCH(request, { params })

      expect(response.status).toBe(404)
      expect(incrementDailyProgress).not.toHaveBeenCalled()
    })

    it('should track progress exactly once per update', async () => {
      const existingNote = {
        id: mockNoteId,
        title: 'Test Note',
        userId: mockUserId,
      }

      const updatedNote = {
        ...existingNote,
        Tag: [],
        NoteLink_NoteLink_fromNoteIdToNote: [],
        NoteLink_NoteLink_toNoteIdToNote: [],
      }

      vi.mocked(prisma.note.findFirst).mockResolvedValue(existingNote as any)
      vi.mocked(prisma.note.update).mockResolvedValue(updatedNote as any)

      const request = new NextRequest(`http://localhost:3000/api/notes/${mockNoteId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content: '<p>Updated content</p>',
        }),
      })

      const params = Promise.resolve({ id: mockNoteId })
      await PATCH(request, { params })

      // Should be called exactly once
      expect(incrementDailyProgress).toHaveBeenCalledTimes(1)
      expect(incrementDailyProgress).toHaveBeenCalledWith(mockUserId, 'noteUpdated')
    })
  })
})
