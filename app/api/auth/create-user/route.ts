import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDefaultAvatar } from "@/lib/avatar-utils";
import { checkAndUnlockAchievement } from "@/lib/gamification-service";

export async function POST(request: NextRequest) {
  try {
    const { id, email, name, image } = await request.json();

    // Generate default avatar if no image provided
    const avatarUrl = image || generateDefaultAvatar(email, "initials");

    // Create user in database
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        image: avatarUrl,
      },
    });

    // Award welcome achievement
    try {
      await checkAndUnlockAchievement(user.id, 'welcome');

      // Check if avatar was uploaded (not a default avatar)
      if (image) {
        await checkAndUnlockAchievement(user.id, 'avatar-upload');
      }

      // Check if profile is complete (has name and avatar)
      if (name && image) {
        await checkAndUnlockAchievement(user.id, 'complete-profile');
      }
    } catch (gamificationError) {
      console.error('Failed to award achievements:', gamificationError);
      // Don't fail user creation if gamification fails
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

