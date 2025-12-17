'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface FlashcardProps {
  front: string
  back: string
  showAnswer?: boolean
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
          className="absolute inset-0 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-8 flex flex-col items-center justify-center backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">Question</p>
          <p className="text-2xl text-gray-900 text-center font-medium">{front}</p>
          <p className="text-sm text-gray-400 mt-8">Click to reveal answer</p>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 bg-blue-600 rounded-xl shadow-xl border-2 border-blue-700 p-8 flex flex-col items-center justify-center backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className="text-sm text-blue-200 mb-4 uppercase tracking-wide">Answer</p>
          <p className="text-2xl text-white text-center font-medium">{back}</p>
          <p className="text-sm text-blue-200 mt-8">Click to flip back</p>
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
