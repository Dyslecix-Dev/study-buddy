/**
 * Utility functions for note linking
 */

/**
 * Extract note IDs from HTML content that contains note links
 * This parses the HTML to find all note-link elements and extracts their noteId attributes
 */
export function extractNoteLinkIds(htmlContent: string): string[] {
  const noteIds: string[] = []

  // Create a temporary DOM element to parse the HTML
  if (typeof window !== 'undefined') {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')

    // Find all elements with data-type="note-link"
    const linkElements = doc.querySelectorAll('[data-type="note-link"]')

    linkElements.forEach(element => {
      const noteId = element.getAttribute('data-note-id')
      if (noteId && !noteIds.includes(noteId)) {
        noteIds.push(noteId)
      }
    })
  } else {
    // Server-side regex fallback
    const regex = /data-note-id="([^"]+)"/g
    let match

    while ((match = regex.exec(htmlContent)) !== null) {
      const noteId = match[1]
      if (noteId && !noteIds.includes(noteId)) {
        noteIds.push(noteId)
      }
    }
  }

  return noteIds
}

/**
 * Find unlinked mentions of a note title in content
 * This helps identify places where a note could be linked but isn't
 */
export function findUnlinkedMentions(content: string, noteTitle: string): number {
  if (!noteTitle || noteTitle.length < 3) return 0

  // Remove existing note links from consideration
  const withoutLinks = content.replace(/<span[^>]*data-type="note-link"[^>]*>.*?<\/span>/g, '')

  // Case-insensitive search for the note title
  const regex = new RegExp(noteTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  const matches = withoutLinks.match(regex)

  return matches ? matches.length : 0
}

/**
 * Check if content contains a link to a specific note
 */
export function containsLinkToNote(content: string, noteId: string): boolean {
  return content.includes(`data-note-id="${noteId}"`)
}
