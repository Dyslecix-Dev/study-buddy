import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'

// Mock Prisma Client
vi.mock('@/lib/prisma', () => ({
  default: {
    folder: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    deck: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    exam: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Share Utilities', () => {
  describe('copyFolder', () => {
    it('should create a folder with sender attribution in name', async () => {
      const { copyFolder } = await import('@/lib/share-utils')
      const prisma = (await import('@/lib/prisma')).default

      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        description: 'Test Description',
        color: 'blue',
        userId: 'sender-id',
        notes: [
          {
            id: 'note-1',
            title: 'Test Note',
            content: 'Test Content',
            tags: [{ id: 'tag-1', name: 'tag1' }],
          },
        ],
      }

      vi.mocked(prisma.folder.findUnique).mockResolvedValue(mockFolder as any)
      vi.mocked(prisma.folder.create).mockResolvedValue({ ...mockFolder, id: 'new-folder-1' } as any)

      await copyFolder('folder-1', 'recipient-id', 'sender@example.com')

      expect(prisma.folder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: expect.stringContaining('(from sender@example.com)'),
            userId: 'recipient-id',
          }),
        })
      )
    })

    it('should copy all notes with tags', async () => {
      const { copyFolder } = await import('@/lib/share-utils')
      const prisma = (await import('@/lib/prisma')).default

      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        userId: 'sender-id',
        notes: [
          {
            id: 'note-1',
            title: 'Note 1',
            content: 'Content 1',
            tags: [{ id: 'tag-1', name: 'important' }],
          },
          {
            id: 'note-2',
            title: 'Note 2',
            content: 'Content 2',
            tags: [{ id: 'tag-2', name: 'review' }],
          },
        ],
      }

      vi.mocked(prisma.folder.findUnique).mockResolvedValue(mockFolder as any)
      vi.mocked(prisma.folder.create).mockResolvedValue({ ...mockFolder, id: 'new-folder-1' } as any)

      await copyFolder('folder-1', 'recipient-id', 'sender@example.com')

      expect(prisma.folder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            notes: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  title: 'Note 1',
                  tags: expect.any(Object),
                }),
                expect.objectContaining({
                  title: 'Note 2',
                  tags: expect.any(Object),
                }),
              ]),
            }),
          }),
        })
      )
    })
  })

  describe('copyDeck', () => {
    it('should reset spaced repetition data', async () => {
      const { copyDeck } = await import('@/lib/share-utils')
      const prisma = (await import('@/lib/prisma')).default

      const mockDeck = {
        id: 'deck-1',
        name: 'Test Deck',
        userId: 'sender-id',
        Flashcard: [
          {
            id: 'card-1',
            question: 'Q1',
            answer: 'A1',
            easeFactor: 2.8,
            interval: 5,
            repetitions: 3,
            nextReview: new Date(),
            tags: [],
          },
        ],
      }

      vi.mocked(prisma.deck.findUnique).mockResolvedValue(mockDeck as any)
      vi.mocked(prisma.deck.create).mockResolvedValue({ ...mockDeck, id: 'new-deck-1' } as any)

      await copyDeck('deck-1', 'recipient-id', 'sender@example.com')

      expect(prisma.deck.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            Flashcard: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  easeFactor: 2.5,
                  interval: 0,
                  repetitions: 0,
                  nextReview: null,
                }),
              ]),
            }),
          }),
        })
      )
    })
  })

  describe('copyExam', () => {
    it('should copy exam without attempt data', async () => {
      const { copyExam } = await import('@/lib/share-utils')
      const prisma = (await import('@/lib/prisma')).default

      const mockExam = {
        id: 'exam-1',
        name: 'Test Exam',
        userId: 'sender-id',
        Question: [
          {
            id: 'q-1',
            question: 'Question 1',
            answer: 'Answer 1',
            type: 'SHORT_ANSWER',
            tags: [],
          },
        ],
      }

      vi.mocked(prisma.exam.findUnique).mockResolvedValue(mockExam as any)
      vi.mocked(prisma.exam.create).mockResolvedValue({ ...mockExam, id: 'new-exam-1' } as any)

      await copyExam('exam-1', 'recipient-id', 'sender@example.com')

      expect(prisma.exam.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: expect.stringContaining('(from sender@example.com)'),
            userId: 'recipient-id',
            Question: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  question: 'Question 1',
                  answer: 'Answer 1',
                }),
              ]),
            }),
          }),
        })
      )
    })

    it('should not include ExamAttempt or QuestionResult fields', async () => {
      const { copyExam } = await import('@/lib/share-utils')
      const prisma = (await import('@/lib/prisma')).default

      const mockExam = {
        id: 'exam-1',
        name: 'Test Exam',
        userId: 'sender-id',
        Question: [{ id: 'q-1', question: 'Q1', answer: 'A1', type: 'SHORT_ANSWER', tags: [] }],
      }

      vi.mocked(prisma.exam.findUnique).mockResolvedValue(mockExam as any)
      vi.mocked(prisma.exam.create).mockResolvedValue({ ...mockExam, id: 'new-exam-1' } as any)

      await copyExam('exam-1', 'recipient-id', 'sender@example.com')

      const createCall = vi.mocked(prisma.exam.create).mock.calls[0][0]
      const questionsCreate = (createCall.data as any).Question.create

      questionsCreate.forEach((q: any) => {
        expect(q).not.toHaveProperty('ExamAttempt')
        expect(q).not.toHaveProperty('QuestionResult')
      })
    })
  })
})
