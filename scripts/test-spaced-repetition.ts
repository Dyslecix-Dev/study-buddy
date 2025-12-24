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

// Test 1: New card progression
let card: FlashcardData = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
}

// First review - Good
card = calculateNextReview(card, 3)

// Second review - Good
card = calculateNextReview(card, 3)

// Third review - Easy
card = calculateNextReview(card, 5)

// Fourth review - Good
card = calculateNextReview(card, 3)

// Test 2: Forgetting a mature card
let matureCard: FlashcardData = {
  easeFactor: 2.6,
  interval: 30,
  repetitions: 6,
}

matureCard = calculateNextReview(matureCard, 0) // Wrong

// Test 3: Rating mapping
mapRatingToQuality(0)
mapRatingToQuality(2)
mapRatingToQuality(3)
mapRatingToQuality(5)

// Test 4: Interval descriptions
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

getIntervalDescription(today)
getIntervalDescription(tomorrow)
getIntervalDescription(threeDays)
getIntervalDescription(twoWeeks)
getIntervalDescription(twoMonths)
getIntervalDescription(oneYear)

// Test 5: Due for review
const yesterday = new Date(today)
yesterday.setDate(today.getDate() - 1)

const nextWeek = new Date(today)
nextWeek.setDate(today.getDate() + 7)

isDueForReview(null)
isDueForReview(undefined)
isDueForReview(yesterday)
isDueForReview(today)
isDueForReview(nextWeek)

// Test 6: Card statistics
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

getCardStatistics(newCard)
getCardStatistics(learningCard)
getCardStatistics(youngCard)
getCardStatistics(matureCardStats)

// Test 7: Edge cases
// Minimum ease factor
let hardCard: FlashcardData = {
  easeFactor: 1.3,
  interval: 1,
  repetitions: 1,
}

hardCard = calculateNextReview(hardCard, 0)

// Multiple "wrong" ratings
let strugglingCard: FlashcardData = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
}

for (let i = 0; i < 5; i++) {
  strugglingCard = calculateNextReview(strugglingCard, 0)
}
