import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, canEditDays } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'

// POST /api/days/migrate — assigns all unowned days to a target student
// Body: { targetUserId: string }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as { role?: string }
  if (!canEditDays(user.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectToDatabase()
  const { targetUserId } = await req.json()
  if (!targetUserId) {
    return NextResponse.json({ error: 'targetUserId required' }, { status: 400 })
  }

  const result = await Day.updateMany(
    { userId: { $exists: false } },
    { $set: { userId: targetUserId } }
  )

  return NextResponse.json({ migrated: result.modifiedCount })
}
