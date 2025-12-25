/**
 * Generates a default avatar URL using DiceBear avatars
 * @param seed - Unique identifier (like user ID or email) to generate consistent avatar
 * @param style - Avatar style (defaults to 'initials')
 * @returns Avatar URL
 */
export function generateDefaultAvatar(seed: string, style: 'initials' | 'identicon' | 'bottts' | 'avataaars' = 'initials'): string {
  // Use DiceBear's free API for avatar generation
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`
}

/**
 * Gets user initials from name or email
 * @param name - User's name
 * @param email - User's email (fallback if no name)
 * @returns User initials (max 2 characters)
 */
export function getUserInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Fallback to email
  return email.substring(0, 2).toUpperCase()
}

/**
 * Checks if an avatar URL is a default (DiceBear) avatar
 * @param avatarUrl - Avatar URL to check
 * @returns True if it's a default avatar
 */
export function isDefaultAvatar(avatarUrl: string | null): boolean {
  if (!avatarUrl) return true
  return avatarUrl.includes('dicebear.com')
}
