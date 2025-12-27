import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initializeCollections } from "@/lib/typesense";

// POST /api/search/init - Initialize Typesense collections
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initializeCollections();

    return NextResponse.json({ success: true, message: "Collections initialized" });
  } catch (error) {
    console.error("Error initializing collections:", error);
    return NextResponse.json({ error: "Failed to initialize collections" }, { status: 500 });
  }
}
