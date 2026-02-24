import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { currentPassword, newEmail, confirmEmail } = body as {
    currentPassword: string
    newEmail: string
    confirmEmail: string
  }

  if (!currentPassword || !newEmail || !confirmEmail) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const trimmedEmail = newEmail.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (trimmedEmail !== confirmEmail.trim().toLowerCase()) {
    return NextResponse.json({ error: 'Email addresses do not match' }, { status: 400 })
  }

  await connectToDatabase()

  const user = await User.findById(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // No-op if email is unchanged
  if (user.email === trimmedEmail) {
    return NextResponse.json({ error: 'New email is the same as current email' }, { status: 400 })
  }

  // Verify current password before allowing email change
  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  // Ensure new email is not already taken
  const existing = await User.findOne({ email: trimmedEmail, _id: { $ne: userId } })
  if (existing) {
    return NextResponse.json({ error: 'Email address is already in use' }, { status: 409 })
  }

  await User.findByIdAndUpdate(userId, { email: trimmedEmail })

  return NextResponse.json({ success: true })
}
