import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'
import User from '@/lib/models/User'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { id?: string; role?: string }
  if (sessionUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectToDatabase()

  // Optional: admin can specify a different target user; defaults to their own account
  const body = await req.json().catch(() => ({}))
  const targetUserId: string = body.targetUserId || sessionUser.id

  const targetUser = await User.findById(targetUserId, 'email username')
  if (!targetUser) return NextResponse.json({ error: 'Target user not found' }, { status: 404 })

  const result = await Day.updateMany(
    { userId: { $exists: false } },
    { $set: { userId: targetUserId } },
  )

  return NextResponse.json({
    migrated: result.modifiedCount,
    targetEmail: targetUser.email,
    targetUsername: targetUser.username,
  })
}
