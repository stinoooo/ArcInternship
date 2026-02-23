import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('avatar') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check file type
    const mimeType = file.type
    const ext = ALLOWED_TYPES[mimeType]
    if (!ext) {
      return NextResponse.json({
        error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.'
      }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 2MB.'
      }, { status: 400 })
    }

    // Safe filename: use userId only (no user-controlled content in path)
    const filename = `${userId}.${ext}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')

    // Ensure directory exists
    await mkdir(uploadsDir, { recursive: true })

    // Write file (safe path - userId cannot contain path traversal chars in MongoDB ObjectIds)
    const filePath = path.join(uploadsDir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Store URL in database
    const avatarUrl = `/uploads/avatars/${filename}`
    await connectToDatabase()
    await User.findByIdAndUpdate(userId, { avatarUrl })

    return NextResponse.json({ avatarUrl })
  } catch (_e) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
