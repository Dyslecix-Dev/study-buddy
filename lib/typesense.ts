import Typesense from "typesense";

// Initialize Typesense client
export const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || "localhost",
      port: parseInt(process.env.TYPESENSE_PORT || "8108"),
      protocol: process.env.TYPESENSE_PROTOCOL || "http",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || "xyz",
  connectionTimeoutSeconds: 2,
});

// Search collection schemas
export const SEARCH_COLLECTIONS = {
  notes: "notes",
  tasks: "tasks",
  flashcards: "flashcards",
  folders: "folders",
  tags: "tags",
} as const;

// Collection schema for notes
export const notesSchema = {
  name: SEARCH_COLLECTIONS.notes,
  fields: [
    { name: "id", type: "string" },
    { name: "userId", type: "string", facet: true },
    { name: "title", type: "string" },
    { name: "content", type: "string" },
    { name: "folderId", type: "string", optional: true, facet: true },
    { name: "folderName", type: "string", optional: true },
    { name: "tags", type: "string[]", facet: true, optional: true },
    { name: "tagIds", type: "string[]", optional: true },
    { name: "createdAt", type: "int64" },
    { name: "updatedAt", type: "int64" },
  ],
  default_sorting_field: "updatedAt",
};

// Collection schema for tasks
export const tasksSchema = {
  name: SEARCH_COLLECTIONS.tasks,
  fields: [
    { name: "id", type: "string" },
    { name: "userId", type: "string", facet: true },
    { name: "title", type: "string" },
    { name: "description", type: "string", optional: true },
    { name: "completed", type: "bool", facet: true },
    { name: "priority", type: "int32", facet: true },
    { name: "dueDate", type: "int64", optional: true },
    { name: "tags", type: "string[]", facet: true, optional: true },
    { name: "tagIds", type: "string[]", optional: true },
    { name: "createdAt", type: "int64" },
    { name: "updatedAt", type: "int64" },
  ],
  default_sorting_field: "createdAt",
};

// Collection schema for flashcards
export const flashcardsSchema = {
  name: SEARCH_COLLECTIONS.flashcards,
  fields: [
    { name: "id", type: "string" },
    { name: "userId", type: "string", facet: true },
    { name: "front", type: "string" },
    { name: "back", type: "string" },
    { name: "deckId", type: "string", facet: true },
    { name: "deckName", type: "string" },
    { name: "tags", type: "string[]", facet: true, optional: true },
    { name: "tagIds", type: "string[]", optional: true },
    { name: "nextReview", type: "int64", optional: true },
    { name: "createdAt", type: "int64" },
    { name: "updatedAt", type: "int64" },
  ],
  default_sorting_field: "createdAt",
};

// Collection schema for folders
export const foldersSchema = {
  name: SEARCH_COLLECTIONS.folders,
  fields: [
    { name: "id", type: "string" },
    { name: "userId", type: "string", facet: true },
    { name: "name", type: "string" },
    { name: "description", type: "string", optional: true },
    { name: "color", type: "string", optional: true },
    { name: "createdAt", type: "int64" },
    { name: "updatedAt", type: "int64" },
  ],
  default_sorting_field: "name",
};

// Collection schema for tags
export const tagsSchema = {
  name: SEARCH_COLLECTIONS.tags,
  fields: [
    { name: "id", type: "string" },
    { name: "userId", type: "string", facet: true },
    { name: "name", type: "string" },
    { name: "color", type: "string", optional: true },
    { name: "usageCount", type: "int32" },
    { name: "createdAt", type: "int64" },
  ],
  default_sorting_field: "usageCount",
};

// Initialize all collections
export async function initializeCollections() {
  const schemas = [notesSchema, tasksSchema, flashcardsSchema, foldersSchema, tagsSchema];

  for (const schema of schemas) {
    try {
      // Try to retrieve the collection
      await typesenseClient.collections(schema.name).retrieve();
      console.log(`Collection ${schema.name} already exists`);
    } catch (error) {
      // Collection doesn't exist, create it
      try {
        await typesenseClient.collections().create(schema);
        console.log(`Created collection: ${schema.name}`);
      } catch (createError) {
        console.error(`Error creating collection ${schema.name}:`, createError);
      }
    }
  }
}

// Delete all collections (useful for development/reset)
export async function deleteAllCollections() {
  const collections = Object.values(SEARCH_COLLECTIONS);

  for (const collection of collections) {
    try {
      await typesenseClient.collections(collection).delete();
      console.log(`Deleted collection: ${collection}`);
    } catch (error) {
      console.error(`Error deleting collection ${collection}:`, error);
    }
  }
}
