import { revalidateTag } from "next/cache";

/**
 * Revalidates the cache for a specific user's data
 * Call this after updating user profile information (name, avatar, etc.)
 */
export async function revalidateUserCache(userId: string) {
  await revalidateTag(`user-${userId}`, 'max');
}
