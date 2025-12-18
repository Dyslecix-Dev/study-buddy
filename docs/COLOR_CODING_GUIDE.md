# Flashcard Color Coding System

## Overview

The flashcard deck view now features **Anki/Quizlet-style color coding** to help you visually identify when cards need to be reviewed.

## Color Legend

### 🔴 **Red - Review Now**
- **When**: Card is due for review today or overdue
- **Action**: Study these cards immediately for best retention
- **Example**: A card scheduled for yesterday or earlier today

### 🟠 **Orange - Later Today**
- **When**: Card is due later today
- **Action**: Plan to review these before end of day
- **Example**: Card scheduled for tonight

### 🟡 **Yellow - This Week (1-7 days)**
- **When**: Card is due within the next 7 days
- **Action**: No immediate urgency, but coming up soon
- **Example**: "In 3 days", "In 5 days"

### 🟢 **Green - This Month (1-4 weeks)**
- **When**: Card is due in 1-4 weeks
- **Action**: Well-spaced, good retention interval
- **Example**: "In 2 weeks", "In 3 weeks"

### 🔵 **Cyan - Months Away (1-12 months)**
- **When**: Card is due in several months
- **Action**: Long-term retention achieved
- **Example**: "In 2 months", "In 6 months"

### 🟣 **Purple - Years Away (1+ years)**
- **When**: Card is due a year or more from now
- **Action**: Excellent long-term retention
- **Example**: "In 1 year", "In 2 years"

### 🔵 **Blue - New**
- **When**: Card has never been reviewed
- **Action**: Study to begin the spaced repetition cycle
- **Repetitions**: 0

## Filter Options

Click the filter buttons to view specific card groups:

- **All**: Show all flashcards in the deck
- **Due**: Show only cards due for review now
- **New**: Show only cards never reviewed
- **Learning**: Show cards with 1-2 reviews (building knowledge)
- **Review**: Show cards with 3+ reviews (established knowledge)

## Card Information

Each card displays:

1. **Status Badge**: Color-coded label showing when to review
2. **Review Count**: Number of times you've reviewed the card (in parentheses)
3. **Card Content**: Front and back of the flashcard
4. **Next Review**: When the card will be due again (bottom of card)

## How the System Updates

### Automatic Date Checking

The system **automatically** determines if cards are due:

1. When you rate a card during study, it calculates the next review date
2. This date is **stored in the database**
3. When you open the deck, the system compares today's date to each card's next review date
4. Cards are colored based on this comparison

### Example Timeline

**Day 1 (12/18)**: You review a card and rate it "Good"
- System sets `nextReview` to **12/19** (tomorrow)
- Card shows **orange** ("Later Today" after midnight)

**Day 2 (12/19)**: You open the deck
- System checks: Is 12/19 >= 12/19? **Yes!**
- Card now shows **red** ("Review Now")
- You study and rate it "Good" again
- System sets `nextReview` to **12/25** (6 days)
- Card shows **yellow** ("In 6 days")

**Day 9 (12/25)**: Card becomes due again
- Shows **red** ("Review Now")
- And so on...

## Benefits

1. **Visual Priority**: Instantly see which cards need attention
2. **Progress Tracking**: Watch cards move from "New" → "Learning" → long intervals
3. **Motivation**: See your knowledge building with longer intervals
4. **Efficiency**: Focus on due cards first, skip cards scheduled far in the future

## Tips

- **Red cards first**: Always prioritize red "Review Now" cards
- **Check daily**: Open your decks daily to catch cards as they become due
- **Don't cram**: Trust the algorithm - longer intervals = better retention
- **Filter strategically**: Use "Due" filter to see only cards needing immediate review

## Technical Details

### Color Determination Logic

```typescript
if (card has never been reviewed) → Blue (New)
else if (card is due now or overdue) → Red (Review Now)
else if (due in < 1 day) → Orange (Later Today)
else if (due in 1-7 days) → Yellow (This Week)
else if (due in 8-30 days) → Green (This Month)
else if (due in 31-365 days) → Cyan (Months Away)
else (due in 365+ days) → Purple (Years Away)
```

### Database Fields Used

- `nextReview`: Date when card is scheduled for review
- `repetitions`: Number of successful reviews
- `easeFactor`: How easy the card is to remember
- `interval`: Days between reviews
- `lastReviewed`: When last studied

## Comparison to Other Systems

### Similar to Anki
- Color-coded cards by due date
- Filter by card status
- Visual feedback on learning progress

### Similar to Quizlet
- Clean, colorful interface
- Easy-to-scan card grid
- Status badges on cards

### Unique Features
- SM-2 algorithm integration
- Real-time color updates
- Detailed review count display
- Multiple time-based color categories

---

**Last Updated**: 2024
**Feature Version**: 1.0
