import { Suspense } from "react";

import NewNotePageContent from "@/app/(dashboard)/notes/new/new-note-content";

export default function NewNotePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <NewNotePageContent />
    </Suspense>
  );
}

