# AI Flashcard Generation

Auto-generate flashcards from notes using Google AI.

## Setup

```bash
# .env
GOOGLE_AI_API_KEY="your_api_key_here"  # Get at https://aistudio.google.com/apikey
```

## Usage

Click "Generate Flashcards" in note editor → Configure (1-50 cards, target deck) → Generate

## API

**POST** `/api/notes/[id]/generate-flashcards`

```json
{
  "count": 10,
  "deckId": "deck_123"  // optional, or use deckName
}
```

## Files

- `lib/google-ai.ts`
- `app/api/notes/[id]/generate-flashcards/route.ts`
- `components/ai/generate-flashcards-modal.tsx`

## Requirements

Note 50+ characters, valid API key, authenticated user

## Pricing

Gemini 1.5 Flash: Free tier 15 req/min, 1,500 req/day. ~$0.001-0.002 per 10 cards.

## Gamification

2 XP per flashcard created
