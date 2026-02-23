import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

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
    if (!ALLOWED_TYPES.has(mimeType)) {
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

    // Convert to base64 data URL — avoids filesystem writes (incompatible with serverless)
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const avatarUrl = `data:${mimeType};base64,${base64}`

    await connectToDatabase()
    await User.findByIdAndUpdate(userId, { avatarUrl })

    return NextResponse.json({ avatarUrl })
  } catch (_e) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
