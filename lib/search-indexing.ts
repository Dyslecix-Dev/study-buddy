import { typesenseClient, SEARCH_COLLECTIONS } from "./typesense";
import { prisma } from "./prisma";

// Helper to extract text from Tiptap JSON content
function extractTextFromContent(content: any): string {
  if (typeof content === "string") return content;
  if (!content) return "";

  let text = "";
  const traverse = (node: any) => {
    if (node.type === "text") {
      text += node.text + " ";
    }
    if (node.content) {
      node.content.forEach(traverse);
    }
  };
  traverse(content);
  return text.trim();
}

// Index a single note
export async function indexNote(noteId: string, userId: string) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        Folder: {
          select: { name: true },
        },
        Tag: {
          select: { id: true, name: true },
        },
      },
    });

    if (!note || note.userId !== userId) {
      console.error("Note not found or unauthorized");
      return;
    }

    const document = {
      id: note.id,
      userId: note.userId,
      title: note.title,
      content: extractTextFromContent(note.content),
      folderId: note.folderId || undefined,
      folderName: note.Folder?.name || undefined,
      tags: note.Tag.map((tag) => tag.name),
      tagIds: note.Tag.map((tag) => tag.id),
      createdAt: Math.floor(note.createdAt.getTime() / 1000),
      updatedAt: Math.floor(note.updatedAt.getTime() / 1000),
    };

    await typesenseClient.collections(SEARCH_COLLECTIONS.notes).documents().upsert(document);
    console.log(`Indexed note: ${note.title}`);
  } catch (error) {
    console.error("Error indexing note:", error);
  }
}

// Index a single task
export async function indexTask(taskId: string, userId: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        Tag: {
          select: { id: true, name: true },
        },
      },
    });

    if (!task || task.userId !== userId) {
      console.error("Task not found or unauthorized");
      return;
    }

    const document = {
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description || undefined,
      completed: task.completed,
      priority: task.priority,
      dueDate: task.dueDate ? Math.floor(task.dueDate.getTime() / 1000) : undefined,
      tags: task.Tag.map((tag) => tag.name),
      tagIds: task.Tag.map((tag) => tag.id),
      createdAt: Math.floor(task.createdAt.getTime() / 1000),
      updatedAt: Math.floor(task.updatedAt.getTime() / 1000),
    };

    await typesenseClient.collections(SEARCH_COLLECTIONS.tasks).documents().upsert(document);
    console.log(`Indexed task: ${task.title}`);
  } catch (error) {
    console.error("Error indexing task:", error);
  }
}

// Index a single flashcard
export async function indexFlashcard(flashcardId: string, userId: string) {
  try {
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: {
        Deck: {
          select: { id: true, name: true, userId: true },
        },
        Tag: {
          select: { id: true, name: true },
        },
      },
    });

    if (!flashcard || flashcard.Deck.userId !== userId) {
      console.error("Flashcard not found or unauthorized");
      return;
    }

    const document = {
      id: flashcard.id,
      userId: flashcard.Deck.userId,
      front: extractTextFromContent(flashcard.front),
      back: extractTextFromContent(flashcard.back),
      deckId: flashcard.deckId,
      deckName: flashcard.Deck.name,
      tags: flashcard.Tag.map((tag) => tag.name),
      tagIds: flashcard.Tag.map((tag) => tag.id),
      nextReview: flashcard.nextReview ? Math.floor(flashcard.nextReview.getTime() / 1000) : undefined,
      createdAt: Math.floor(flashcard.createdAt.getTime() / 1000),
      updatedAt: Math.floor(flashcard.updatedAt.getTime() / 1000),
    };

    await typesenseClient.collections(SEARCH_COLLECTIONS.flashcards).documents().upsert(document);
    console.log(`Indexed flashcard: ${flashcard.id}`);
  } catch (error) {
    console.error("Error indexing flashcard:", error);
  }
}

// Index a single folder
export async function indexFolder(folderId: string, userId: string) {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder || folder.userId !== userId) {
      console.error("Folder not found or unauthorized");
      return;
    }

    const document = {
      id: folder.id,
      userId: folder.userId,
      name: folder.name,
      description: folder.description || undefined,
      color: folder.color || undefined,
      createdAt: Math.floor(folder.createdAt.getTime() / 1000),
      updatedAt: Math.floor(folder.updatedAt.getTime() / 1000),
    };

    await typesenseClient.collections(SEARCH_COLLECTIONS.folders).documents().upsert(document);
    console.log(`Indexed folder: ${folder.name}`);
  } catch (error) {
    console.error("Error indexing folder:", error);
  }
}

// Index a single tag
export async function indexTag(tagId: string, userId: string) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: {
            Note: true,
            Task: true,
            Flashcard: true,
          },
        },
      },
    });

    if (!tag || tag.userId !== userId) {
      console.error("Tag not found or unauthorized");
      return;
    }

    const usageCount = tag._count.Note + tag._count.Task + tag._count.Flashcard;

    const document = {
      id: tag.id,
      userId: tag.userId,
      name: tag.name,
      color: tag.color || undefined,
      usageCount,
      createdAt: Math.floor(tag.createdAt.getTime() / 1000),
    };

    await typesenseClient.collections(SEARCH_COLLECTIONS.tags).documents().upsert(document);
    console.log(`Indexed tag: ${tag.name}`);
  } catch (error) {
    console.error("Error indexing tag:", error);
  }
}

// Delete document from index
export async function deleteFromIndex(collection: keyof typeof SEARCH_COLLECTIONS, documentId: string) {
  try {
    await typesenseClient.collections(SEARCH_COLLECTIONS[collection]).documents(documentId).delete();
    console.log(`Deleted ${collection} document: ${documentId}`);
  } catch (error) {
    console.error(`Error deleting ${collection} document:`, error);
  }
}

// Bulk index all user content
export async function indexAllUserContent(userId: string) {
  try {
    console.log(`Starting bulk indexing for user: ${userId}`);

    // Index all folders
    const folders = await prisma.folder.findMany({ where: { userId } });
    for (const folder of folders) {
      await indexFolder(folder.id, userId);
    }

    // Index all notes
    const notes = await prisma.note.findMany({ where: { userId } });
    for (const note of notes) {
      await indexNote(note.id, userId);
    }

    // Index all tasks
    const tasks = await prisma.task.findMany({ where: { userId } });
    for (const task of tasks) {
      await indexTask(task.id, userId);
    }

    // Index all flashcards
    const decks = await prisma.deck.findMany({
      where: { userId },
      include: { Flashcard: true },
    });
    for (const deck of decks) {
      for (const flashcard of deck.Flashcard) {
        await indexFlashcard(flashcard.id, userId);
      }
    }

    // Index all tags
    const tags = await prisma.tag.findMany({ where: { userId } });
    for (const tag of tags) {
      await indexTag(tag.id, userId);
    }

    console.log(`Completed bulk indexing for user: ${userId}`);
  } catch (error) {
    console.error("Error in bulk indexing:", error);
    throw error;
  }
}

// Delete all user content from index
export async function deleteAllUserContent(userId: string) {
  try {
    const collections = Object.values(SEARCH_COLLECTIONS);

    for (const collection of collections) {
      await typesenseClient.collections(collection).documents().delete({
        filter_by: `userId:=${userId}`,
      });
    }

    console.log(`Deleted all indexed content for user: ${userId}`);
  } catch (error) {
    console.error("Error deleting user content from index:", error);
  }
}
