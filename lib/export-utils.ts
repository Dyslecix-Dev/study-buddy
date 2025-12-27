/**
 * Export utilities for notes and flashcards
 * Provides functions to convert data to various export formats
 */

import { JSONContent } from "@tiptap/core";

// Types for export data
export interface NoteExportData {
  id: string;
  title: string;
  content: JSONContent;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{ id: string; name: string; color: string }>;
}

export interface FlashcardExportData {
  id: string;
  front: JSONContent;
  back: JSONContent;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview?: string;
  lastReviewed?: string;
  createdAt: string;
  tags?: Array<{ id: string; name: string; color: string }>;
}

export interface DeckExportData {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  flashcards: FlashcardExportData[];
}

/**
 * Convert Tiptap JSON content to Markdown
 */
export function tiptapToMarkdown(content: JSONContent): string {
  if (!content || !content.content) {
    return "";
  }

  let markdown = "";

  for (const node of content.content) {
    markdown += processNode(node);
  }

  return markdown.trim();
}

/**
 * Process individual Tiptap nodes recursively
 */
function processNode(node: JSONContent): string {
  let result = "";

  switch (node.type) {
    case "paragraph":
      result = processInlineContent(node) + "\n\n";
      break;

    case "heading":
      const level = node.attrs?.level || 1;
      result = "#".repeat(level) + " " + processInlineContent(node) + "\n\n";
      break;

    case "bulletList":
      if (node.content) {
        for (const item of node.content) {
          result += "- " + processInlineContent(item) + "\n";
        }
      }
      result += "\n";
      break;

    case "orderedList":
      if (node.content) {
        node.content.forEach((item, index) => {
          result += `${index + 1}. ` + processInlineContent(item) + "\n";
        });
      }
      result += "\n";
      break;

    case "listItem":
      result = processInlineContent(node);
      break;

    case "codeBlock":
      const language = node.attrs?.language || "";
      result = "```" + language + "\n" + getTextContent(node) + "\n```\n\n";
      break;

    case "blockquote":
      const quoteText = processInlineContent(node)
        .split("\n")
        .map((line) => "> " + line)
        .join("\n");
      result = quoteText + "\n\n";
      break;

    case "horizontalRule":
      result = "---\n\n";
      break;

    case "hardBreak":
      result = "  \n";
      break;

    default:
      result = processInlineContent(node);
  }

  return result;
}

/**
 * Process inline content with formatting
 */
function processInlineContent(node: JSONContent): string {
  if (!node.content) {
    return "";
  }

  let result = "";

  for (const child of node.content) {
    if (child.type === "text") {
      let text = child.text || "";

      // Apply marks (bold, italic, code, etc.)
      if (child.marks) {
        for (const mark of child.marks) {
          switch (mark.type) {
            case "bold":
              text = `**${text}**`;
              break;
            case "italic":
              text = `*${text}*`;
              break;
            case "code":
              text = "`" + text + "`";
              break;
            case "strike":
              text = `~~${text}~~`;
              break;
            case "link":
              text = `[${text}](${mark.attrs?.href || ""})`;
              break;
          }
        }
      }

      result += text;
    } else if (child.type === "hardBreak") {
      result += "  \n";
    } else {
      // Recursively process nested content
      result += processNode(child);
    }
  }

  return result;
}

/**
 * Get plain text content from a node
 */
function getTextContent(node: JSONContent): string {
  if (node.text) {
    return node.text;
  }

  if (!node.content) {
    return "";
  }

  return node.content.map(getTextContent).join("");
}

/**
 * Export notes from a folder as a Markdown file
 */
export function exportNotesAsMarkdown(
  folderName: string,
  notes: NoteExportData[]
): string {
  let markdown = `# ${folderName}\n\n`;
  markdown += `Exported on: ${new Date().toLocaleString()}\n\n`;
  markdown += `Total notes: ${notes.length}\n\n`;
  markdown += "---\n\n";

  for (const note of notes) {
    markdown += `## ${note.title}\n\n`;

    // Add metadata
    markdown += `*Created: ${new Date(note.createdAt).toLocaleDateString()}*  \n`;
    markdown += `*Updated: ${new Date(note.updatedAt).toLocaleDateString()}*\n\n`;

    // Add tags if present
    if (note.tags && note.tags.length > 0) {
      markdown += `**Tags:** ${note.tags.map((tag) => tag.name).join(", ")}\n\n`;
    }

    // Add content
    markdown += tiptapToMarkdown(note.content);
    markdown += "\n\n---\n\n";
  }

  return markdown;
}

/**
 * Export a single note as Markdown
 */
export function exportSingleNoteAsMarkdown(note: NoteExportData): string {
  let markdown = `# ${note.title}\n\n`;
  markdown += `*Created: ${new Date(note.createdAt).toLocaleDateString()}*  \n`;
  markdown += `*Updated: ${new Date(note.updatedAt).toLocaleDateString()}*\n\n`;

  if (note.tags && note.tags.length > 0) {
    markdown += `**Tags:** ${note.tags.map((tag) => tag.name).join(", ")}\n\n`;
  }

  markdown += "---\n\n";
  markdown += tiptapToMarkdown(note.content);

  return markdown;
}

/**
 * Export flashcard deck as CSV (Anki-compatible format)
 * Format: front, back, tags
 */
export function exportDeckAsCSV(deck: DeckExportData): string {
  // CSV Header
  let csv = "Front,Back,Tags,EaseFactor,Interval,Repetitions,NextReview\n";

  for (const card of deck.flashcards) {
    // Convert front and back to plain text (remove markdown)
    const front = escapeCSV(tiptapToPlainText(card.front));
    const back = escapeCSV(tiptapToPlainText(card.back));
    const tags = card.tags ? card.tags.map((t) => t.name).join(";") : "";
    const nextReview = card.nextReview
      ? new Date(card.nextReview).toLocaleDateString()
      : "";

    csv += `${front},${back},${tags},${card.easeFactor},${card.interval},${card.repetitions},${nextReview}\n`;
  }

  return csv;
}

/**
 * Convert Tiptap JSON to plain text (no formatting)
 */
function tiptapToPlainText(content: JSONContent): string {
  if (!content || !content.content) {
    return "";
  }

  return content.content.map(getTextContent).join("\n").trim();
}

/**
 * Escape CSV special characters
 */
function escapeCSV(text: string): string {
  // If text contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (text.includes(",") || text.includes("\n") || text.includes('"')) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download notes as Markdown file
 */
export function downloadNotesAsMarkdown(
  folderName: string,
  notes: NoteExportData[]
) {
  const markdown = exportNotesAsMarkdown(folderName, notes);
  const filename = `${folderName.replace(/[^a-z0-9]/gi, "_")}_notes_${
    new Date().toISOString().split("T")[0]
  }.md`;
  downloadFile(markdown, filename, "text/markdown");
}

/**
 * Download single note as Markdown file
 */
export function downloadSingleNoteAsMarkdown(note: NoteExportData) {
  const markdown = exportSingleNoteAsMarkdown(note);
  const filename = `${note.title.replace(/[^a-z0-9]/gi, "_")}_${
    new Date().toISOString().split("T")[0]
  }.md`;
  downloadFile(markdown, filename, "text/markdown");
}

/**
 * Download deck as CSV file
 */
export function downloadDeckAsCSV(deck: DeckExportData) {
  const csv = exportDeckAsCSV(deck);
  const filename = `${deck.name.replace(/[^a-z0-9]/gi, "_")}_flashcards_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  downloadFile(csv, filename, "text/csv");
}
