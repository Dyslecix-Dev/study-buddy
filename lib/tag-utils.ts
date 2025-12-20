// Predefined color palette for tags
export const TAG_COLORS = [
  { name: 'Red', value: '#ef4444', bgClass: 'bg-red-100', textClass: 'text-red-800', borderClass: 'border-red-200' },
  { name: 'Orange', value: '#f97316', bgClass: 'bg-orange-100', textClass: 'text-orange-800', borderClass: 'border-orange-200' },
  { name: 'Yellow', value: '#eab308', bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', borderClass: 'border-yellow-200' },
  { name: 'Green', value: '#22c55e', bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-200' },
  { name: 'Blue', value: '#3b82f6', bgClass: 'bg-blue-100', textClass: 'text-blue-800', borderClass: 'border-blue-200' },
  { name: 'Indigo', value: '#6366f1', bgClass: 'bg-indigo-100', textClass: 'text-indigo-800', borderClass: 'border-indigo-200' },
  { name: 'Purple', value: '#a855f7', bgClass: 'bg-purple-100', textClass: 'text-purple-800', borderClass: 'border-purple-200' },
  { name: 'Pink', value: '#ec4899', bgClass: 'bg-pink-100', textClass: 'text-pink-800', borderClass: 'border-pink-200' },
  { name: 'Gray', value: '#6b7280', bgClass: 'bg-gray-100', textClass: 'text-gray-800', borderClass: 'border-gray-200' },
]

// Get color classes for a tag based on its color value
export function getTagColorClasses(color: string | null) {
  if (!color) {
    // Default to gray
    return {
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-800',
      borderClass: 'border-gray-200',
    }
  }

  const tagColor = TAG_COLORS.find((c) => c.value === color)
  if (tagColor) {
    return {
      bgClass: tagColor.bgClass,
      textClass: tagColor.textClass,
      borderClass: tagColor.borderClass,
    }
  }

  // Fallback to gray if color not found
  return {
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
    borderClass: 'border-gray-200',
  }
}

// Get a random color for new tags
export function getRandomTagColor(): string {
  const randomIndex = Math.floor(Math.random() * TAG_COLORS.length)
  return TAG_COLORS[randomIndex].value
}

export interface Tag {
  id: string
  name: string
  color: string | null
  createdAt: Date
}
