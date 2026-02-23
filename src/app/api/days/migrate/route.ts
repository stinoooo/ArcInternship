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

  const body = await req.json().catch(() => ({}))
  const targetUserId: string = body.targetUserId || sessionUser.id

  const targetUser = await User.findById(targetUserId, 'email username')
  if (!targetUser) return NextResponse.json({ error: 'Target user not found' }, { status: 404 })

  const unownedDays = await Day.find({ userId: { $exists: false } }).lean()

  let migrated = 0  // directly reassigned
  let merged = 0   // legacy content written into already-existing day, legacy deleted

  for (const legacy of unownedDays) {
    try {
      // Happy path: no conflict — just stamp the userId
      const res = await Day.updateOne(
        { _id: legacy._id, userId: { $exists: false } },
        { $set: { userId: targetUserId } },
      )
      if (res.modifiedCount > 0) migrated++
    } catch (err: unknown) {
      const isDuplicate =
        err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000

      if (!isDuplicate) throw err

      // Conflict: target user already has a day for this date (e.g. from onboarding seed).
      // Preserve any filled-in content from the legacy day, then remove it.
      const hasContent = legacy.activities || legacy.isComplete
      if (hasContent) {
        await Day.findOneAndUpdate(
          { userId: targetUserId, date: legacy.date },
          {
            $set: {
              type: legacy.type,
              startTime: legacy.startTime,
              endTime: legacy.endTime,
              hours: legacy.hours,
              ...(legacy.activities ? { activities: legacy.activities } : {}),
              ...(legacy.isComplete ? { isComplete: true } : {}),
            },
          },
        )
      }
      await Day.deleteOne({ _id: legacy._id })
      merged++
    }
  }

  return NextResponse.json({
    migrated,
    merged,
    total: migrated + merged,
    targetEmail: targetUser.email,
    targetUsername: targetUser.username,
  })
}
