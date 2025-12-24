"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the combined tasks page with calendar view
    router.replace("/tasks");
  }, [router]);

  return null;
}

