# AI Exam Generation

Auto-generate exam questions from notes using Google AI.

## Setup

```bash
# .env
GOOGLE_AI_API_KEY="your_api_key_here"  # Get at https://aistudio.google.com/apikey
```

## Usage

Click "Generate Exam" in note editor → Configure (1-50 questions, types, target exam) → Generate

## API

**POST** `/api/notes/[id]/generate-exam`

```json
{
  "questionCount": 10,
  "questionTypes": ["multiple_choice", "select_all", "true_false"],
  "examId": "exam_123"  // optional, or use examName
}
```

## Files

- `lib/google-ai.ts`
- `app/api/notes/[id]/generate-exam/route.ts`
- `components/ai/generate-exam-modal.tsx`

## Requirements

Note 50+ characters, valid API key, authenticated user

## Pricing

Gemini 1.5 Flash: Free tier 15 req/min, 1,500 req/day. ~$0.002-0.005 per 10 questions.

## Gamification

8 XP per exam created
