import Fuse from "fuse.js";
import { prisma } from "./prisma";

export interface SearchFilters {
  type?: "note" | "task" | "flashcard" | "folder" | "tag" | "all";
  tags?: string[]; // Tag names to filter by
  completed?: boolean; // For tasks
  priority?: number; // For tasks
  folderId?: string; // For notes
  deckId?: string; // For flashcards
  dueDateFrom?: Date; // For tasks
  dueDateTo?: Date; // For tasks
  createdFrom?: Date;
  createdTo?: Date;
}

export interface SearchResult {
  type: "note" | "task" | "flashcard" | "folder" | "tag";
  id: string;
  title: string;
  content?: string;
  url: string;
  tags?: string[];
  metadata?: Record<string, any>;
  highlight?: {
    title?: string;
    content?: string;
  };
}

// Parse search syntax like "tag:math due:today type:task"
export function parseSearchQuery(query: string): { cleanQuery: string; filters: SearchFilters } {
  const filters: SearchFilters = { type: "all" };
  let cleanQuery = query;

  // Extract type: filter
  const typeMatch = query.match(/type:(\w+)/i);
  if (typeMatch) {
    const type = typeMatch[1].toLowerCase();
    if (["note", "task", "flashcard", "folder", "tag"].includes(type)) {
      filters.type = type as any;
    }
    cleanQuery = cleanQuery.replace(typeMatch[0], "").trim();
  }

  // Extract tag: filter (can be multiple)
  const tagMatches = query.matchAll(/tag:(\w+)/gi);
  const tags: string[] = [];
  for (const match of tagMatches) {
    tags.push(match[1]);
    cleanQuery = cleanQuery.replace(match[0], "").trim();
  }
  if (tags.length > 0) {
    filters.tags = tags;
  }

  // Extract due: filter for tasks
  const dueMatch = query.match(/due:(today|tomorrow|week|overdue)/i);
  if (dueMatch) {
    const dueValue = dueMatch[1].toLowerCase();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (dueValue) {
      case "today":
        filters.dueDateFrom = now;
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);
        filters.dueDateTo = endOfToday;
        break;
      case "tomorrow":
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filters.dueDateFrom = tomorrow;
        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);
        filters.dueDateTo = endOfTomorrow;
        break;
      case "week":
        filters.dueDateFrom = now;
        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        filters.dueDateTo = endOfWeek;
        break;
      case "overdue":
        filters.dueDateTo = now;
        break;
    }
    cleanQuery = cleanQuery.replace(dueMatch[0], "").trim();
  }

  // Extract completed: filter for tasks
  const completedMatch = query.match(/completed:(true|false|yes|no)/i);
  if (completedMatch) {
    const value = completedMatch[1].toLowerCase();
    filters.completed = value === "true" || value === "yes";
    cleanQuery = cleanQuery.replace(completedMatch[0], "").trim();
  }

  // Extract priority: filter for tasks
  const priorityMatch = query.match(/priority:([0-3])/i);
  if (priorityMatch) {
    filters.priority = parseInt(priorityMatch[1]);
    cleanQuery = cleanQuery.replace(priorityMatch[0], "").trim();
  }

  return { cleanQuery: cleanQuery.trim(), filters };
}

// Extract plain text from HTML content for search indexing
function extractPlainText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Fetch and prepare data for searching
async function fetchSearchData(userId: string, filters: SearchFilters) {
  const data: any = {
    notes: [],
    tasks: [],
    flashcards: [],
    folders: [],
    tags: [],
  };

  // Determine which types to fetch
  const shouldFetch = {
    notes: !filters.type || filters.type === "all" || filters.type === "note",
    tasks: !filters.type || filters.type === "all" || filters.type === "task",
    flashcards: !filters.type || filters.type === "all" || filters.type === "flashcard",
    folders: !filters.type || filters.type === "all" || filters.type === "folder",
    tags: !filters.type || filters.type === "all" || filters.type === "tag",
  };

  // Build filter conditions for database queries
  const dateFilters: any = {};
  if (filters.createdFrom) {
    dateFilters.createdAt = { gte: filters.createdFrom };
  }
  if (filters.createdTo) {
    dateFilters.createdAt = { ...dateFilters.createdAt, lte: filters.createdTo };
  }

  // Fetch notes
  if (shouldFetch.notes) {
    const noteWhere: any = { userId, ...dateFilters };
    if (filters.folderId) noteWhere.folderId = filters.folderId;
    if (filters.tags && filters.tags.length > 0) {
      noteWhere.Tag = {
        some: {
          name: { in: filters.tags },
        },
      };
    }

    data.notes = await prisma.note.findMany({
      where: noteWhere,
      include: {
        Tag: { select: { name: true } },
        Folder: { select: { name: true } },
      },
      take: 100,
    });
  }

  // Fetch tasks
  if (shouldFetch.tasks) {
    const taskWhere: any = { userId, ...dateFilters };
    if (filters.completed !== undefined) taskWhere.completed = filters.completed;
    if (filters.priority !== undefined) taskWhere.priority = filters.priority;
    if (filters.dueDateFrom || filters.dueDateTo) {
      taskWhere.dueDate = {};
      if (filters.dueDateFrom) taskWhere.dueDate.gte = filters.dueDateFrom;
      if (filters.dueDateTo) taskWhere.dueDate.lte = filters.dueDateTo;
    }
    if (filters.tags && filters.tags.length > 0) {
      taskWhere.Tag = {
        some: {
          name: { in: filters.tags },
        },
      };
    }

    data.tasks = await prisma.task.findMany({
      where: taskWhere,
      include: {
        Tag: { select: { name: true } },
      },
      take: 100,
    });
  }

  // Fetch flashcards
  if (shouldFetch.flashcards) {
    const flashcardWhere: any = {
      Deck: { userId },
      ...dateFilters,
    };
    if (filters.deckId) flashcardWhere.deckId = filters.deckId;
    if (filters.tags && filters.tags.length > 0) {
      flashcardWhere.Tag = {
        some: {
          name: { in: filters.tags },
        },
      };
    }

    data.flashcards = await prisma.flashcard.findMany({
      where: flashcardWhere,
      include: {
        Tag: { select: { name: true } },
        Deck: { select: { name: true } },
      },
      take: 100,
    });
  }

  // Fetch folders
  if (shouldFetch.folders) {
    data.folders = await prisma.folder.findMany({
      where: { userId, ...dateFilters },
      take: 100,
    });
  }

  // Fetch tags
  if (shouldFetch.tags) {
    data.tags = await prisma.tag.findMany({
      where: {
        userId,
        ...(filters.tags && filters.tags.length > 0 ? { name: { in: filters.tags } } : {}),
      },
      include: {
        _count: {
          select: {
            Note: true,
            Task: true,
            Flashcard: true,
          },
        },
      },
      take: 100,
    });
  }

  return data;
}

// Perform advanced search using Fuse.js
export async function advancedSearch(
  query: string,
  userId: string,
  filters: SearchFilters = {}
): Promise<SearchResult[]> {
  try {
    // Parse query for inline filters
    const { cleanQuery, filters: parsedFilters } = parseSearchQuery(query);

    // Merge parsed filters with provided filters
    const mergedFilters: SearchFilters = { ...parsedFilters, ...filters };

    // Fetch data from database
    const data = await fetchSearchData(userId, mergedFilters);

    const allResults: SearchResult[] = [];

    // Search notes
    if (data.notes.length > 0) {
      const notesFuse = new Fuse(data.notes, {
        keys: ["title", "content"],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true,
      });

      const noteResults = cleanQuery
        ? notesFuse.search(cleanQuery)
        : data.notes.map((item, index) => ({ item, refIndex: index, score: 0 }));

      for (const result of noteResults.slice(0, 20)) {
        const note = result.item;
        allResults.push({
          type: "note",
          id: note.id,
          title: note.title,
          content: extractPlainText(note.content as string).substring(0, 200),
          url: note.folderId ? `/notes/${note.folderId}/edit/${note.id}` : `/notes/${note.id}`,
          tags: note.Tag?.map((t: any) => t.name) || [],
          metadata: {
            folderId: note.folderId,
            folderName: note.Folder?.name,
          },
          highlight: result.matches
            ? {
                title: result.matches.find((m) => m.key === "title")?.value,
                content: result.matches.find((m) => m.key === "content")?.value,
              }
            : undefined,
        });
      }
    }

    // Search tasks
    if (data.tasks.length > 0) {
      const tasksFuse = new Fuse(data.tasks, {
        keys: ["title", "description"],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true,
      });

      const taskResults = cleanQuery
        ? tasksFuse.search(cleanQuery)
        : data.tasks.map((item, index) => ({ item, refIndex: index, score: 0 }));

      for (const result of taskResults.slice(0, 20)) {
        const task = result.item;
        allResults.push({
          type: "task",
          id: task.id,
          title: task.title,
          content: task.description || "",
          url: `/tasks`,
          tags: task.Tag?.map((t: any) => t.name) || [],
          metadata: {
            completed: task.completed,
            priority: task.priority,
            dueDate: task.dueDate,
          },
          highlight: result.matches
            ? {
                title: result.matches.find((m) => m.key === "title")?.value,
                content: result.matches.find((m) => m.key === "description")?.value,
              }
            : undefined,
        });
      }
    }

    // Search flashcards
    if (data.flashcards.length > 0) {
      const flashcardsFuse = new Fuse(data.flashcards, {
        keys: ["front", "back"],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true,
      });

      const flashcardResults = cleanQuery
        ? flashcardsFuse.search(cleanQuery)
        : data.flashcards.map((item, index) => ({ item, refIndex: index, score: 0 }));

      for (const result of flashcardResults.slice(0, 20)) {
        const flashcard = result.item;
        allResults.push({
          type: "flashcard",
          id: flashcard.id,
          title: extractPlainText(flashcard.front as string).substring(0, 100),
          content: extractPlainText(flashcard.back as string).substring(0, 200),
          url: `/flashcards/${flashcard.deckId}`,
          tags: flashcard.Tag?.map((t: any) => t.name) || [],
          metadata: {
            deckId: flashcard.deckId,
            deckName: flashcard.Deck?.name,
          },
          highlight: result.matches
            ? {
                title: result.matches.find((m) => m.key === "front")?.value,
                content: result.matches.find((m) => m.key === "back")?.value,
              }
            : undefined,
        });
      }
    }

    // Search folders
    if (data.folders.length > 0) {
      const foldersFuse = new Fuse(data.folders, {
        keys: ["name", "description"],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true,
      });

      const folderResults = cleanQuery
        ? foldersFuse.search(cleanQuery)
        : data.folders.map((item, index) => ({ item, refIndex: index, score: 0 }));

      for (const result of folderResults.slice(0, 20)) {
        const folder = result.item;
        allResults.push({
          type: "folder",
          id: folder.id,
          title: folder.name,
          content: folder.description || "",
          url: `/notes/${folder.id}`,
          metadata: {
            color: folder.color,
          },
          highlight: result.matches
            ? {
                title: result.matches.find((m) => m.key === "name")?.value,
                content: result.matches.find((m) => m.key === "description")?.value,
              }
            : undefined,
        });
      }
    }

    // Search tags
    if (data.tags.length > 0) {
      const tagsFuse = new Fuse(data.tags, {
        keys: ["name"],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true,
      });

      const tagResults = cleanQuery
        ? tagsFuse.search(cleanQuery)
        : data.tags.map((item, index) => ({ item, refIndex: index, score: 0 }));

      for (const result of tagResults.slice(0, 20)) {
        const tag = result.item;
        const usageCount = tag._count.Note + tag._count.Task + tag._count.Flashcard;
        allResults.push({
          type: "tag",
          id: tag.id,
          title: tag.name,
          content: `Used in ${usageCount} items`,
          url: `/tags`,
          metadata: {
            color: tag.color,
            usageCount,
          },
          highlight: result.matches
            ? {
                title: result.matches.find((m) => m.key === "name")?.value,
              }
            : undefined,
        });
      }
    }

    return allResults;
  } catch (error) {
    console.error("Error in advanced search:", error);
    throw error;
  }
}

// Get search suggestions based on partial query
export async function getSearchSuggestions(query: string, userId: string): Promise<string[]> {
  if (!query || query.length < 2) return [];

  try {
    const results = await advancedSearch(query, userId, { type: "all" });
    const suggestions = new Set<string>();

    // Extract unique titles from results
    results.slice(0, 5).forEach((result) => {
      suggestions.add(result.title);
    });

    return Array.from(suggestions);
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return [];
  }
}
