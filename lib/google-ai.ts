import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("GOOGLE_AI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export interface FlashcardPair {
  front: string;
  back: string;
}

export interface ExamQuestion {
  question: string;
  questionType: "multiple_choice" | "select_all" | "true_false";
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

/**
 * Extract plain text from HTML content
 * Removes HTML tags and cleans up the text for AI processing
 */
export function extractPlainText(htmlContent: string): string {
  return htmlContent
    .replace(/<[^>]*>/g, " ") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Generate flashcards from note content using Google AI
 * @param noteContent - The plain text content of the note
 * @param count - Number of flashcards to generate (default: 10)
 * @returns Array of flashcard pairs
 */
export async function generateFlashcards(noteContent: string, count: number = 10): Promise<FlashcardPair[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert study assistant. Given the following study material, create ${count} high-quality flashcards.

Study Material:
${noteContent}

Instructions:
1. Create exactly ${count} flashcards
2. Each flashcard should focus on a single concept or fact
3. Questions should be clear and concise
4. Answers should be accurate and comprehensive but not overly long (2-3 sentences max)
5. Cover the most important concepts from the material
6. Use a variety of question types (definition, explanation, application, comparison, etc.)

Format your response as a valid JSON array of objects with "front" and "back" properties:
[
  {
    "front": "Question or term here",
    "back": "Answer or definition here"
  },
  ...
]

IMPORTANT: Return ONLY the JSON array, no additional text before or after.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    // Parse JSON
    const flashcards: FlashcardPair[] = JSON.parse(jsonText);

    // Validate response structure
    if (!Array.isArray(flashcards)) {
      throw new Error("AI response is not an array");
    }

    // Validate each flashcard has front and back
    for (const card of flashcards) {
      if (!card.front || !card.back) {
        throw new Error("Invalid flashcard format: missing front or back");
      }
    }

    // Limit to requested count
    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards. Please try again.");
  }
}

/**
 * Generate exam questions from note content using Google AI
 * @param noteContent - The plain text content of the note
 * @param count - Number of questions to generate (default: 10)
 * @param questionTypes - Types of questions to generate
 * @returns Array of exam questions
 */
export async function generateExamQuestions(
  noteContent: string,
  count: number = 10,
  questionTypes: ("multiple_choice" | "select_all" | "true_false")[] = ["multiple_choice", "select_all", "true_false"]
): Promise<ExamQuestion[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert exam question creator. Given the following study material, create ${count} high-quality exam questions.

Study Material:
${noteContent}

Instructions:
1. Create exactly ${count} questions
2. Use a mix of question types: ${questionTypes.join(", ")}
3. Each question should test understanding, not just memorization
4. For multiple_choice: Create 4 options with exactly 1 correct answer
5. For select_all: Create 4-6 options with 2-3 correct answers
6. For true_false: Create a statement with a true or false answer
7. Questions should be clear, unambiguous, and based on the material
8. Avoid trick questions or overly complex language
9. Cover the most important concepts from the material

Format your response as a valid JSON array of objects:
[
  {
    "question": "Question text here?",
    "questionType": "multiple_choice",
    "options": [
      { "text": "Option A", "isCorrect": false },
      { "text": "Option B", "isCorrect": true },
      { "text": "Option C", "isCorrect": false },
      { "text": "Option D", "isCorrect": false }
    ]
  },
  {
    "question": "Question text here?",
    "questionType": "select_all",
    "options": [
      { "text": "Option A", "isCorrect": true },
      { "text": "Option B", "isCorrect": false },
      { "text": "Option C", "isCorrect": true },
      { "text": "Option D", "isCorrect": false }
    ]
  },
  {
    "question": "Statement here.",
    "questionType": "true_false",
    "options": [
      { "text": "True", "isCorrect": true },
      { "text": "False", "isCorrect": false }
    ]
  }
]

IMPORTANT:
- Return ONLY the JSON array, no additional text before or after
- questionType must be exactly: "multiple_choice", "select_all", or "true_false"
- For multiple_choice: exactly 1 option must be correct
- For select_all: 2 or more options must be correct
- For true_false: exactly 2 options (True and False), one correct`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    // Parse JSON
    const questions: ExamQuestion[] = JSON.parse(jsonText);

    // Validate response structure
    if (!Array.isArray(questions)) {
      throw new Error("AI response is not an array");
    }

    // Validate each question
    for (const q of questions) {
      if (!q.question || !q.questionType || !q.options || !Array.isArray(q.options)) {
        throw new Error("Invalid question format: missing required fields");
      }

      if (!["multiple_choice", "select_all", "true_false"].includes(q.questionType)) {
        throw new Error(`Invalid question type: ${q.questionType}`);
      }

      // Validate options
      const correctCount = q.options.filter((opt) => opt.isCorrect).length;
      if (q.questionType === "multiple_choice" && correctCount !== 1) {
        // Fix: Set only the first correct option
        let fixed = false;
        q.options.forEach((opt) => {
          if (opt.isCorrect && !fixed) {
            fixed = true;
          } else {
            opt.isCorrect = false;
          }
        });
      } else if (q.questionType === "true_false" && q.options.length !== 2) {
        throw new Error("True/false questions must have exactly 2 options");
      }
    }

    // Limit to requested count
    return questions.slice(0, count);
  } catch (error) {
    console.error("Error generating exam questions:", error);
    throw new Error("Failed to generate exam questions. Please try again.");
  }
}
