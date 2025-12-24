import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const entityType = formData.get('entityType') as string // 'note' or 'flashcard'
    const entityId = formData.get('entityId') as string
    const side = formData.get('side') as string | null // 'front' or 'back' for flashcards

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      )
    }

    if (!['note', 'flashcard'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entityType. Must be "note" or "flashcard"' },
        { status: 400 }
      )
    }

    if (entityType === 'flashcard' && (!side || !['front', 'back'].includes(side))) {
      return NextResponse.json(
        { error: 'For flashcards, side must be "front" or "back"' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Generate file path based on folder structure
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    let filePath: string
    if (entityType === 'note') {
      filePath = `users/${user.id}/notes/${entityId}/${fileName}`
    } else {
      filePath = `users/${user.id}/flashcards/${entityId}/${side}-${fileName}`
    }

    // Upload to Vercel Blob
    const blob = await put(filePath, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      path: filePath,
      size: file.size,
      type: file.type,
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
