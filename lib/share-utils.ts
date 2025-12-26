import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

/**
 * Generate a unique name by appending sender info
 * Falls back to UUID if name still conflicts
 */
async function generateUniqueName(
  baseName: string,
  senderEmail: string,
  userId: string,
  type: "folder" | "deck" | "exam"
): Promise<string> {
  const senderName = senderEmail.split("@")[0];
  let candidateName = `${baseName} (from ${senderName})`;

  // Check if this name exists
  let exists = false;
  switch (type) {
    case "folder":
      exists = !!(await prisma.folder.findFirst({
        where: { userId, name: candidateName },
      }));
      break;
    case "deck":
      exists = !!(await prisma.deck.findFirst({
        where: { userId, name: candidateName },
      }));
      break;
    case "exam":
      exists = !!(await prisma.exam.findFirst({
        where: { userId, name: candidateName },
      }));
      break;
  }

  // If it still exists, append UUID
  if (exists) {
    const shortId = randomUUID().split("-")[0];
    candidateName = `${baseName} (from ${senderName}) ${shortId}`;
  }

  return candidateName;
}

/**
 * Deep copy a folder with all its notes
 * Preserves tags, removes note links that point outside the folder
 */
export async function copyFolder(folderId: string, recipientId: string, senderEmail: string) {
  const originalFolder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      Note: {
        include: {
          Tag: true,
          NoteLink_NoteLink_fromNoteIdToNote: {
            include: {
              Note_NoteLink_toNoteIdToNote: true,
            },
          },
        },
      },
    },
  });

  if (!originalFolder) {
    throw new Error("Folder not found");
  }

  // Generate unique folder name
  const uniqueFolderName = await generateUniqueName(
    originalFolder.name,
    senderEmail,
    recipientId,
    "folder"
  );

  // Create new folder
  const newFolder = await prisma.folder.create({
    data: {
      id: randomUUID(),
      name: uniqueFolderName,
      description: originalFolder.description,
      color: originalFolder.color,
      userId: recipientId,
    },
  });

  // Map old note IDs to new note IDs
  const noteIdMap = new Map<string, string>();

  // Create all notes first
  for (const note of originalFolder.Note) {
    const newNoteId = randomUUID();
    noteIdMap.set(note.id, newNoteId);

    await prisma.note.create({
      data: {
        id: newNoteId,
        title: note.title,
        content: note.content as any,
        userId: recipientId,
        folderId: newFolder.id,
        Tag: {
          connect: note.Tag.map((tag) => ({ id: tag.id })),
        },
      },
    });
  }

  // Create note links only for notes within the same folder
  for (const note of originalFolder.Note) {
    const newFromNoteId = noteIdMap.get(note.id);
    if (!newFromNoteId) continue;

    for (const link of note.NoteLink_NoteLink_fromNoteIdToNote) {
      const newToNoteId = noteIdMap.get(link.toNoteId);

      // Only create link if target note is also in the copied folder
      if (newToNoteId) {
        await prisma.noteLink.create({
          data: {
            id: randomUUID(),
            fromNoteId: newFromNoteId,
            toNoteId: newToNoteId,
          },
        });
      }
    }
  }

  return newFolder;
}

/**
 * Deep copy a deck with all its flashcards
 * Preserves tags, resets spaced repetition data
 */
export async function copyDeck(deckId: string, recipientId: string, senderEmail: string) {
  const originalDeck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      Flashcard: {
        include: {
          Tag: true,
        },
      },
    },
  });

  if (!originalDeck) {
    throw new Error("Deck not found");
  }

  // Generate unique deck name
  const uniqueDeckName = await generateUniqueName(
    originalDeck.name,
    senderEmail,
    recipientId,
    "deck"
  );

  // Create new deck
  const newDeck = await prisma.deck.create({
    data: {
      id: randomUUID(),
      name: uniqueDeckName,
      description: originalDeck.description,
      color: originalDeck.color,
      userId: recipientId,
    },
  });

  // Copy all flashcards with reset spaced repetition data
  for (const flashcard of originalDeck.Flashcard) {
    await prisma.flashcard.create({
      data: {
        id: randomUUID(),
        front: flashcard.front as any,
        back: flashcard.back as any,
        deckId: newDeck.id,
        easeFactor: 2.5, // Reset to default
        interval: 0, // Reset to default
        repetitions: 0, // Reset to default
        nextReview: null, // Reset to default
        lastReviewed: null, // Reset to default
        Tag: {
          connect: flashcard.Tag.map((tag) => ({ id: tag.id })),
        },
      },
    });
  }

  return newDeck;
}

/**
 * Deep copy an exam with all its questions
 * Preserves tags, resets exam attempt data
 */
export async function copyExam(examId: string, recipientId: string, senderEmail: string) {
  const originalExam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      Question: {
        include: {
          Tag: true,
        },
      },
    },
  });

  if (!originalExam) {
    throw new Error("Exam not found");
  }

  // Generate unique exam name
  const uniqueExamName = await generateUniqueName(
    originalExam.name,
    senderEmail,
    recipientId,
    "exam"
  );

  // Create new exam
  const newExam = await prisma.exam.create({
    data: {
      id: randomUUID(),
      name: uniqueExamName,
      description: originalExam.description,
      color: originalExam.color,
      userId: recipientId,
    },
  });

  // Copy all questions
  for (const question of originalExam.Question) {
    await prisma.question.create({
      data: {
        id: randomUUID(),
        question: question.question as any,
        questionType: question.questionType,
        options: question.options as any,
        examId: newExam.id,
        Tag: {
          connect: question.Tag.map((tag) => ({ id: tag.id })),
        },
      },
    });
  }

  // Note: ExamAttempt and QuestionResult are NOT copied (reset for recipient)

  return newExam;
}
