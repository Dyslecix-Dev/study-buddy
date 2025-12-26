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
    } catch (gamificationError) {
      console.error('Failed to award welcome achievement:', gamificationError);
      // Don't fail user creation if gamification fails
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

