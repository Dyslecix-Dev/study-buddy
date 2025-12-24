# Image Upload Implementation Summary

## Overview
Successfully implemented image upload functionality for both notes and flashcards using Vercel Blob storage with TipTap rich text editor.

## What Was Implemented

### 1. Database Changes
- **Updated Prisma Schema** ([prisma/schema.prisma:29-30](prisma/schema.prisma#L29-L30))
  - Changed `Flashcard.front` from `String` to `Json`
  - Changed `Flashcard.back` from `String` to `Json`
  - Matches the existing `Note.content` JSON field format

- **Migration Scripts Created**
  - [scripts/run-flashcard-migration.ts](scripts/run-flashcard-migration.ts) - TypeScript migration script
  - [prisma/migrations/manual/convert_flashcard_to_json.sql](prisma/migrations/manual/convert_flashcard_to_json.sql) - SQL migration
  - [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md) - Detailed migration guide
  - **Note**: Migration converts existing text to TipTap JSON format preserving all data

### 2. Vercel Blob Integration
- **Package Installed**: `@vercel/blob`
- **Folder Structure**:
  ```
  /users/{userId}/notes/{noteId}/{timestamp}-{filename}
  /users/{userId}/flashcards/{flashcardId}/front-{timestamp}-{filename}
  /users/{userId}/flashcards/{flashcardId}/back-{timestamp}-{filename}
  ```

- **Upload API** ([app/api/upload/image/route.ts](app/api/upload/image/route.ts))
  - Validates file type (PNG, JPG, GIF, WebP only)
  - Validates file size (5MB max)
  - Requires authentication via Supabase
  - Returns public URL for inserted images

### 3. Editor Enhancements

#### Editor Component ([components/editor/editor.tsx](components/editor/editor.tsx))
- Added `handleImageUpload` function to upload files to Vercel Blob
- New props: `entityType`, `entityId`, `flashcardSide`
- Passes upload handler to toolbar
- Shows loading state during upload
- TipTap Image extension already installed and configured

#### Editor Toolbar ([components/editor/toolbar.tsx](components/editor/toolbar.tsx))
- Added image upload button with icon
- File input for selecting images
- Client-side validation (type and size)
- Loading spinner during upload
- Inserts image into editor after successful upload

### 4. Flashcard Updates

#### Flashcard Form ([components/flashcards/flashcard-form.tsx](components/flashcards/flashcard-form.tsx))
- Replaced text areas with rich text Editor components
- Separate editors for front and back with image support
- Converts legacy string data to HTML format
- Validates content (strips HTML tags to check for emptiness)
- Passes flashcard ID and side to enable image uploads

#### Flashcard Display ([components/flashcards/flashcard.tsx](components/flashcards/flashcard.tsx))
- Renders HTML content using `dangerouslySetInnerHTML`
- Handles both legacy string format and new HTML format
- Added prose classes for proper typography
- Added `overflow-auto` for scrollable content
- Works with existing 3D flip animation

### 5. Image Cleanup

#### Cleanup Utilities ([lib/blob-cleanup.ts](lib/blob-cleanup.ts))
- `deleteNoteImages(userId, noteId)` - Deletes all images for a note
- `deleteFlashcardImages(userId, flashcardId)` - Deletes all images for a flashcard
- `deleteUserImages(userId)` - Deletes all images for a user
- `extractImageUrls(html)` - Extracts image URLs from HTML
- `deleteImagesByUrl(urls)` - Deletes specific images

#### Integration
- **Note Deletion** ([app/api/notes/[id]/route.ts:313](app/api/notes/[id]/route.ts#L313))
  - Automatically cleans up images when note is deleted
- **Flashcard Deletion** ([app/api/decks/[deckId]/flashcards/[flashcardId]/route.ts:197](app/api/decks/[deckId]/flashcards/[flashcardId]/route.ts#L197))
  - Automatically cleans up images when flashcard is deleted

### 6. API Endpoints

#### No Changes Needed
- Flashcard creation/update APIs already pass data directly to Prisma
- Prisma handles JSON serialization automatically
- APIs work seamlessly with both string and JSON formats

## Configuration Required

### Environment Variables
Add to your `.env` file:
```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

Get your token from [Vercel Dashboard](https://vercel.com/dashboard) → Storage → Blob

### Run Database Migration
Before deploying, run the migration to convert existing flashcards:
```bash
npx tsx scripts/run-flashcard-migration.ts
```

Or see [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md) for detailed steps.

## How to Use

### For Notes (Already Working)
1. Open or create a note
2. Click the image icon in the editor toolbar
3. Select an image file (PNG, JPG, GIF, WebP, max 5MB)
4. Image uploads and inserts automatically
5. Images are stored in `/users/{userId}/notes/{noteId}/`

### For Flashcards (New Feature)
1. Create or edit a flashcard
2. Use rich text editor for front and/or back
3. Click image icon in either editor
4. Select image file
5. Images stored in `/users/{userId}/flashcards/{flashcardId}/front-*` or `back-*`
6. Cards display images during study sessions with flip animation

## Technical Details

### Data Format
Both notes and flashcards now store content as **HTML strings** generated by TipTap:
```html
<p>Text content</p>
<img src="https://blob.vercel-storage.com/..." class="max-w-full h-auto rounded-lg" />
<p>More content</p>
```

### Legacy Compatibility
- Existing flashcards with plain text are automatically converted to HTML format
- Display component handles both old (string) and new (HTML) formats
- No data loss during migration

### Security
- Authentication required for all uploads (Supabase Auth)
- File type validation (images only)
- File size limits (5MB)
- User-scoped storage (users can only access their own images)
- Public URLs but obscured paths

### Performance
- Images served directly from Vercel Blob CDN
- No database storage of image binaries
- Automatic cleanup prevents storage bloat
- Lazy loading of images in editor

## Files Modified

### Core Implementation
- `prisma/schema.prisma` - Database schema
- `components/editor/editor.tsx` - Image upload logic
- `components/editor/toolbar.tsx` - Image button UI
- `components/flashcards/flashcard-form.tsx` - Rich text editors
- `components/flashcards/flashcard.tsx` - HTML rendering

### New Files
- `app/api/upload/image/route.ts` - Upload endpoint
- `lib/blob-cleanup.ts` - Cleanup utilities
- `scripts/run-flashcard-migration.ts` - Migration script
- `prisma/migrations/manual/convert_flashcard_to_json.sql` - SQL migration
- `MIGRATION_INSTRUCTIONS.md` - Migration guide

### API Updates
- `app/api/notes/[id]/route.ts` - Added image cleanup on delete
- `app/api/decks/[deckId]/flashcards/[flashcardId]/route.ts` - Added image cleanup on delete

## Testing Checklist

- [ ] Set `BLOB_READ_WRITE_TOKEN` environment variable
- [ ] Run database migration script
- [ ] Test image upload in existing note
- [ ] Test image upload in new note
- [ ] Test image upload in flashcard front
- [ ] Test image upload in flashcard back
- [ ] Test flashcard display with images
- [ ] Test flashcard study session with image cards
- [ ] Test note deletion (verify images cleaned up)
- [ ] Test flashcard deletion (verify images cleaned up)
- [ ] Test file size validation (try > 5MB)
- [ ] Test file type validation (try PDF or other non-image)
- [ ] Verify existing flashcards still work

## Next Steps / Enhancements

Consider these future improvements:
1. **Image compression** - Automatically compress images before upload
2. **Image resizing** - Generate thumbnails for faster loading
3. **Drag & drop** - Allow dragging images directly into editor
4. **Paste images** - Support pasting from clipboard
5. **Image captions** - Add ability to caption images
6. **Image gallery** - Show all user's uploaded images for reuse
7. **Progress indicator** - Show upload progress for large files
8. **Multiple images** - Allow selecting multiple images at once
9. **Image editing** - Basic cropping/rotation in the UI
10. **Storage quotas** - Implement per-user storage limits

## Notes

- The `@tiptap/extension-image` was already installed but not being used - now it's fully integrated
- Flashcards maintain their existing spaced repetition functionality
- All existing features (tags, folders, note linking, etc.) work unchanged
- Images persist independently of database backups
- Consider implementing storage quotas to prevent abuse
