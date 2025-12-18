/**
 * Manual test script for Spaced Repetition System
 * Run with: npx tsx scripts/test-spaced-repetition.ts
 */

import {
  calculateNextReview,
  mapRatingToQuality,
  getIntervalDescription,
  isDueForReview,
  getCardStatistics,
  type FlashcardData,
} from '../lib/spaced-repetition'

console.log('🧪 Testing Spaced Repetition System (SM-2 Algorithm)\n')

// Test 1: New card progression
console.log('Test 1: New Card Progression')
console.log('=' .repeat(50))

let card: FlashcardData = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
}

console.log('Initial state:', card)

// First review - Good
card = calculateNextReview(card, 3)
console.log('\nAfter rating "Good" (3):', {
  interval: card.interval,
  repetitions: card.repetitions,
  easeFactor: card.easeFactor.toFixed(2),
  nextReview: card.nextReview.toISOString().split('T')[0],
})

// Second review - Good
card = calculateNextReview(card, 3)
console.log('\nAfter rating "Good" (3) again:', {
  interval: card.interval,
  repetitions: card.repetitions,
  easeFactor: card.easeFactor.toFixed(2),
  nextReview: card.nextReview.toISOString().split('T')[0],
})

// Third review - Easy
card = calculateNextReview(card, 5)
console.log('\nAfter rating "Easy" (5):', {
  interval: card.interval,
  repetitions: card.repetitions,
  easeFactor: card.easeFactor.toFixed(2),
  nextReview: card.nextReview.toISOString().split('T')[0],
})

// Fourth review - Good
card = calculateNextReview(card, 3)
console.log('\nAfter rating "Good" (3):', {
  interval: card.interval,
  repetitions: card.repetitions,
  easeFactor: card.easeFactor.toFixed(2),
  nextReview: card.nextReview.toISOString().split('T')[0],
})

// Test 2: Forgetting a mature card
console.log('\n\nTest 2: Forgetting a Mature Card')
console.log('=' .repeat(50))

let matureCard: FlashcardData = {
  easeFactor: 2.6,
  interval: 30,
  repetitions: 6,
}

console.log('Mature card state:', matureCard)

matureCard = calculateNextReview(matureCard, 0) // Wrong
console.log('\nAfter rating "Wrong" (0):', {
  interval: matureCard.interval,
  repetitions: matureCard.repetitions,
  easeFactor: matureCard.easeFactor.toFixed(2),
  nextReview: matureCard.nextReview.toISOString().split('T')[0],
})

// Test 3: Rating mapping
console.log('\n\nTest 3: Rating Mapping')
console.log('=' .repeat(50))

console.log('UI Rating -> SM-2 Quality:')
console.log('  Wrong (0) -> ', mapRatingToQuality(0))
console.log('  Hard (2) -> ', mapRatingToQuality(2))
console.log('  Good (3) -> ', mapRatingToQuality(3))
console.log('  Easy (5) -> ', mapRatingToQuality(5))

// Test 4: Interval descriptions
console.log('\n\nTest 4: Interval Descriptions')
console.log('=' .repeat(50))

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

const threeDays = new Date(today)
threeDays.setDate(today.getDate() + 3)

const twoWeeks = new Date(today)
twoWeeks.setDate(today.getDate() + 14)

const twoMonths = new Date(today)
twoMonths.setDate(today.getDate() + 60)

const oneYear = new Date(today)
oneYear.setDate(today.getDate() + 365)

console.log('Today:', getIntervalDescription(today))
console.log('Tomorrow:', getIntervalDescription(tomorrow))
console.log('3 days:', getIntervalDescription(threeDays))
console.log('2 weeks:', getIntervalDescription(twoWeeks))
console.log('2 months:', getIntervalDescription(twoMonths))
console.log('1 year:', getIntervalDescription(oneYear))

// Test 5: Due for review
console.log('\n\nTest 5: Due for Review Check')
console.log('=' .repeat(50))

const yesterday = new Date(today)
yesterday.setDate(today.getDate() - 1)

const nextWeek = new Date(today)
nextWeek.setDate(today.getDate() + 7)

console.log('null:', isDueForReview(null))
console.log('undefined:', isDueForReview(undefined))
console.log('Yesterday:', isDueForReview(yesterday))
console.log('Today:', isDueForReview(today))
console.log('Next week:', isDueForReview(nextWeek))

// Test 6: Card statistics
console.log('\n\nTest 6: Card Statistics')
console.log('=' .repeat(50))

const newCard: FlashcardData = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
}

const learningCard: FlashcardData = {
  easeFactor: 2.5,
  interval: 1,
  repetitions: 1,
  nextReview: tomorrow,
}

const youngCard: FlashcardData = {
  easeFactor: 2.6,
  interval: 10,
  repetitions: 3,
  nextReview: nextWeek,
}

const matureCardStats: FlashcardData = {
  easeFactor: 2.8,
  interval: 45,
  repetitions: 8,
  nextReview: twoMonths,
}

console.log('\nNew Card:', getCardStatistics(newCard))
console.log('\nLearning Card:', getCardStatistics(learningCard))
console.log('\nYoung Card:', getCardStatistics(youngCard))
console.log('\nMature Card:', getCardStatistics(matureCardStats))

// Test 7: Edge cases
console.log('\n\nTest 7: Edge Cases')
console.log('=' .repeat(50))

// Minimum ease factor
let hardCard: FlashcardData = {
  easeFactor: 1.3,
  interval: 1,
  repetitions: 1,
}

hardCard = calculateNextReview(hardCard, 0)
console.log('\nEase factor after "Wrong" on minimum EF:')
console.log('  Should be >= 1.3:', hardCard.easeFactor >= 1.3)
console.log('  Actual:', hardCard.easeFactor.toFixed(2))

// Multiple "wrong" ratings
let strugglingCard: FlashcardData = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
}

console.log('\nMultiple "Wrong" ratings:')
for (let i = 0; i < 5; i++) {
  strugglingCard = calculateNextReview(strugglingCard, 0)
  console.log(`  Attempt ${i + 1}: EF=${strugglingCard.easeFactor.toFixed(2)}, interval=${strugglingCard.interval}`)
}

console.log('\n✅ All tests completed!')
console.log('\nNext steps:')
console.log('1. Test the API endpoint with actual flashcards')
console.log('2. Review a few cards in the study session')
console.log('3. Check the database to verify scheduling data')
