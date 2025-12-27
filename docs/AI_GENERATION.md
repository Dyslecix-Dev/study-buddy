# AI Generation

Auto-generate flashcards and exam questions from notes using Google AI.

## Setup

```bash
# .env
GOOGLE_AI_API_KEY="your_api_key_here"  # Get at https://aistudio.google.com/apikey
```

## Flashcards

### Usage

Click "Generate Flashcards" in note editor → Configure (1-50 cards, target deck) → Generate

### API

**POST** `/api/notes/[id]/generate-flashcards`

```json
{
  "count": 10,
  "deckId": "deck_123"  // optional, or use deckName
}
```

### Gamification

2 XP per flashcard created

## Exams

### Usage

Click "Generate Exam" in note editor → Configure (1-50 questions, types, target exam) → Generate

### API

**POST** `/api/notes/[id]/generate-exam`

```json
{
  "questionCount": 10,
  "questionTypes": ["multiple_choice", "select_all", "true_false"],
  "examId": "exam_123"  // optional, or use examName
}
```

### Gamification

8 XP per exam created

## Files

- `lib/google-ai.ts`
- `app/api/notes/[id]/generate-flashcards/route.ts`
- `app/api/notes/[id]/generate-exam/route.ts`
- `components/ai/generate-flashcards-modal.tsx`
- `components/ai/generate-exam-modal.tsx`

## Requirements

Note 50+ characters, valid API key, authenticated user

## Pricing

Gemini 1.5 Flash: Free tier 15 req/min, 1,500 req/day. ~$0.001-0.005 per 10 items.
