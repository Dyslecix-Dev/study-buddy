import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

// Public endpoint for uploading avatars during signup (before user is authenticated)
export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` }, { status: 400 });
    }

    // Generate file path with temporary ID (will be organized by user ID later if needed)
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `signup-avatar-${Date.now()}.${extension}`;
    const filePath = `users/temp/${fileName}`;

    // Upload to Vercel Blob
    const blob = await put(filePath, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      path: filePath,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}
