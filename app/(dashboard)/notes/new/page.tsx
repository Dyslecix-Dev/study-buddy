import { Suspense } from "react";

import NewNotePageContent from "@/app/(dashboard)/notes/new/new-note-content";

export default function NewNotePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        </div>
      }
    >
      <NewNotePageContent />
    </Suspense>
  );
}

