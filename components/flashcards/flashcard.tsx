'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface FlashcardProps {
  front: string | any
  back: string | any
  showAnswer?: boolean
}

// Helper to render content - handles both legacy strings and new HTML/JSON format
function renderContent(content: string | any): string {
  if (typeof content === 'string') {
    // Check if it's HTML
    if (content.startsWith('<')) {
      return content;
    }
    // Legacy plain text
    return content;
  }
  // JSON format from TipTap - shouldn't happen in display, but handle it
  return JSON.stringify(content);
}

export default function Flashcard({ front, back, showAnswer = false }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(showAnswer)

  return (
    <div
      className="relative w-full h-80 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-8 flex flex-col backface-hidden overflow-auto"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide text-center">Question</p>
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full py-4">
            <div
              className="prose prose-lg max-w-full text-gray-900 mx-auto [&_p]:text-center [&_p]:text-xl [&_p]:font-medium [&_p]:my-2 [&_h1]:text-center [&_h2]:text-center [&_h3]:text-center [&_img]:block [&_img]:mx-auto [&_img]:max-w-full [&_img]:max-h-44 [&_img]:h-auto [&_img]:object-contain [&_img]:my-3"
              dangerouslySetInnerHTML={{ __html: renderContent(front) }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-4 text-center">Click to reveal answer</p>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 bg-blue-600 rounded-xl shadow-xl border-2 border-blue-700 p-8 flex flex-col backface-hidden overflow-auto"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className="text-sm text-blue-200 mb-4 uppercase tracking-wide text-center">Answer</p>
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full py-4">
            <div
              className="prose prose-lg prose-invert max-w-full text-white mx-auto [&_p]:text-center [&_p]:text-xl [&_p]:font-medium [&_p]:my-2 [&_h1]:text-center [&_h2]:text-center [&_h3]:text-center [&_img]:block [&_img]:mx-auto [&_img]:max-w-full [&_img]:max-h-44 [&_img]:h-auto [&_img]:object-contain [&_img]:my-3"
              dangerouslySetInnerHTML={{ __html: renderContent(back) }}
            />
          </div>
          <p className="text-sm text-blue-200 mt-4 text-center">Click to flip back</p>
        </div>
      </motion.div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  )
}
