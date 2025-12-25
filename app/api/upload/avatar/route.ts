import { put, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidateUserCache } from "@/lib/cache-utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Get existing user data to delete old avatar if exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { image: true },
    });

    // Delete old avatar from blob storage if it exists and is not a default avatar
    if (existingUser?.image && existingUser.image.includes("vercel-storage.com")) {
      try {
        await del(existingUser.image);
      } catch (error) {
        console.error("Failed to delete old avatar:", error);
        // Continue even if deletion fails
      }
    }

    // Generate file path
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `avatar-${Date.now()}.${extension}`;
    const filePath = `users/${user.id}/avatar/${fileName}`;

    // Upload to Vercel Blob
    const blob = await put(filePath, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Update user profile with new avatar URL
    await prisma.user.update({
      where: { id: user.id },
      data: { image: blob.url },
    });

    // Revalidate the user cache so the navbar shows the new avatar
    revalidateUserCache(user.id);

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

