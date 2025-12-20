import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags - Get all tags for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    // Build where clause to find tags created by this user
    const where: any = {
      userId: user.id,
    }

    // If search query provided, filter by name
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            Note: true,
            Task: true,
            Flashcard: true,
          },
        },
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, color } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    // Check if tag already exists for this user (case-insensitive)
    const existingTag = await prisma.tag.findFirst({
      where: {
        userId: user.id,
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    })

    if (existingTag) {
      // Return existing tag instead of creating duplicate
      return NextResponse.json(existingTag)
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || null,
        userId: user.id,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
