import { typesenseClient, SEARCH_COLLECTIONS } from "./typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";

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

// Build filter query for Typesense
function buildFilterQuery(filters: SearchFilters, userId: string): string {
  const conditions: string[] = [`userId:=${userId}`];

  if (filters.tags && filters.tags.length > 0) {
    const tagConditions = filters.tags.map((tag) => `tags:=${tag}`);
    conditions.push(`(${tagConditions.join(" && ")})`);
  }

  if (filters.completed !== undefined) {
    conditions.push(`completed:=${filters.completed}`);
  }

  if (filters.priority !== undefined) {
    conditions.push(`priority:=${filters.priority}`);
  }

  if (filters.folderId) {
    conditions.push(`folderId:=${filters.folderId}`);
  }

  if (filters.deckId) {
    conditions.push(`deckId:=${filters.deckId}`);
  }

  if (filters.dueDateFrom) {
    const timestamp = Math.floor(filters.dueDateFrom.getTime() / 1000);
    conditions.push(`dueDate:>=${timestamp}`);
  }

  if (filters.dueDateTo) {
    const timestamp = Math.floor(filters.dueDateTo.getTime() / 1000);
    conditions.push(`dueDate:<=${timestamp}`);
  }

  if (filters.createdFrom) {
    const timestamp = Math.floor(filters.createdFrom.getTime() / 1000);
    conditions.push(`createdAt:>=${timestamp}`);
  }

  if (filters.createdTo) {
    const timestamp = Math.floor(filters.createdTo.getTime() / 1000);
    conditions.push(`createdAt:<=${timestamp}`);
  }

  return conditions.join(" && ");
}

// Perform advanced search across all collections
export async function advancedSearch(query: string, userId: string, filters: SearchFilters = {}): Promise<SearchResult[]> {
  try {
    // Parse query for inline filters
    const { cleanQuery, filters: parsedFilters } = parseSearchQuery(query);

    // Merge parsed filters with provided filters
    const mergedFilters: SearchFilters = { ...parsedFilters, ...filters };

    // Determine which collections to search
    const collectionsToSearch =
      mergedFilters.type === "all" || !mergedFilters.type
        ? (["notes", "tasks", "flashcards", "folders", "tags"] as const)
        : mergedFilters.type === "note"
          ? (["notes"] as const)
          : mergedFilters.type === "task"
            ? (["tasks"] as const)
            : mergedFilters.type === "flashcard"
              ? (["flashcards"] as const)
              : mergedFilters.type === "folder"
                ? (["folders"] as const)
                : (["tags"] as const);

    const allResults: SearchResult[] = [];

    // Search each collection
    for (const collection of collectionsToSearch) {
      try {
        const searchParams: SearchParams = {
          q: cleanQuery || "*",
          query_by: collection === "notes" ? "title,content" : collection === "tasks" ? "title,description" : collection === "flashcards" ? "front,back" : collection === "folders" ? "name,description" : "name",
          filter_by: buildFilterQuery(mergedFilters, userId),
          per_page: 20,
          highlight_full_fields: "title,content,description,front,back,name",
        };

        const results = await typesenseClient.collections(SEARCH_COLLECTIONS[collection]).documents().search(searchParams);

        // Transform results
        if (results.hits) {
          for (const hit of results.hits) {
            const doc = hit.document as any;
            const highlights = hit.highlights || [];

            let result: SearchResult;

            switch (collection) {
              case "notes":
                result = {
                  type: "note",
                  id: doc.id,
                  title: doc.title,
                  content: doc.content,
                  url: doc.folderId ? `/notes/${doc.folderId}/edit/${doc.id}` : `/notes/${doc.id}`,
                  tags: doc.tags,
                  metadata: {
                    folderId: doc.folderId,
                    folderName: doc.folderName,
                  },
                };
                break;

              case "tasks":
                result = {
                  type: "task",
                  id: doc.id,
                  title: doc.title,
                  content: doc.description,
                  url: `/tasks`,
                  tags: doc.tags,
                  metadata: {
                    completed: doc.completed,
                    priority: doc.priority,
                    dueDate: doc.dueDate,
                  },
                };
                break;

              case "flashcards":
                result = {
                  type: "flashcard",
                  id: doc.id,
                  title: doc.front,
                  content: doc.back,
                  url: `/flashcards/${doc.deckId}`,
                  tags: doc.tags,
                  metadata: {
                    deckId: doc.deckId,
                    deckName: doc.deckName,
                  },
                };
                break;

              case "folders":
                result = {
                  type: "folder",
                  id: doc.id,
                  title: doc.name,
                  content: doc.description,
                  url: `/notes/${doc.id}`,
                  metadata: {
                    color: doc.color,
                  },
                };
                break;

              case "tags":
                result = {
                  type: "tag",
                  id: doc.id,
                  title: doc.name,
                  content: `Used in ${doc.usageCount} items`,
                  url: `/tags`,
                  metadata: {
                    color: doc.color,
                    usageCount: doc.usageCount,
                  },
                };
                break;

              default:
                continue;
            }

            // Add highlights if available
            if (highlights.length > 0) {
              result.highlight = {};
              for (const h of highlights) {
                if (h.field === "title" || h.field === "name") {
                  result.highlight.title = h.snippet || "";
                } else {
                  result.highlight.content = h.snippet || "";
                }
              }
            }

            allResults.push(result);
          }
        }
      } catch (error) {
        console.error(`Error searching ${collection}:`, error);
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
