/**
 * Utilities for cleaning up Vercel Blob storage
 */

import { list, del } from '@vercel/blob'

/**
 * Delete all images associated with a specific note
 */
export async function deleteNoteImages(userId: string, noteId: string) {
  try {
    const prefix = `users/${userId}/notes/${noteId}/`
    const { blobs } = await list({ prefix })

    if (blobs.length > 0) {
      await del(blobs.map(blob => blob.url))
      console.log(`Deleted ${blobs.length} images for note ${noteId}`)
    }
  } catch (error) {
    console.error(`Failed to delete images for note ${noteId}:`, error)
    // Don't throw - we don't want to fail note deletion if blob cleanup fails
  }
}

/**
 * Delete all images associated with a specific flashcard
 */
export async function deleteFlashcardImages(userId: string, flashcardId: string) {
  try {
    const prefix = `users/${userId}/flashcards/${flashcardId}/`
    const { blobs } = await list({ prefix })

    if (blobs.length > 0) {
      await del(blobs.map(blob => blob.url))
      console.log(`Deleted ${blobs.length} images for flashcard ${flashcardId}`)
    }
  } catch (error) {
    console.error(`Failed to delete images for flashcard ${flashcardId}:`, error)
    // Don't throw - we don't want to fail flashcard deletion if blob cleanup fails
  }
}

/**
 * Delete all images for a specific user (for account deletion)
 */
export async function deleteUserImages(userId: string) {
  try {
    const prefix = `users/${userId}/`
    const { blobs } = await list({ prefix })

    if (blobs.length > 0) {
      await del(blobs.map(blob => blob.url))
      console.log(`Deleted ${blobs.length} images for user ${userId}`)
    }
  } catch (error) {
    console.error(`Failed to delete images for user ${userId}:`, error)
    // Don't throw - we don't want to fail user deletion if blob cleanup fails
  }
}

/**
 * Extract image URLs from HTML content
 */
export function extractImageUrls(html: string): string[] {
  const imgRegex = /<img[^>]+src="([^">]+)"/g
  const urls: string[] = []
  let match

  while ((match = imgRegex.exec(html)) !== null) {
    urls.push(match[1])
  }

  return urls
}

/**
 * Delete specific images by their URLs
 */
export async function deleteImagesByUrl(urls: string[]) {
  try {
    if (urls.length > 0) {
      await del(urls)
      console.log(`Deleted ${urls.length} images by URL`)
    }
  } catch (error) {
    console.error('Failed to delete images by URL:', error)
    // Don't throw
  }
}
