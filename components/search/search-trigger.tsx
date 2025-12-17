'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SearchTrigger() {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  const handleClick = () => {
    // Trigger the keyboard event to open the command palette
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
    >
      <Search size={18} />
      <span>Search</span>
      <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
        {isMac ? '⌘' : 'Ctrl'}K
      </kbd>
    </button>
  )
}
