import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import Day from '@/lib/models/Day'
import { seedDaysForUser } from '@/lib/seedDays'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { id?: string; role?: string }
  const isAdmin = sessionUser.role === 'admin'

  const body = await req.json().catch(() => ({}))
  // Admins can seed for any user; others only for themselves
  const targetUserId: string = (isAdmin && body.userId) || sessionUser.id || ''
  if (!targetUserId) return NextResponse.json({ error: 'No user id' }, { status: 400 })
  if (!isAdmin && targetUserId !== sessionUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectToDatabase()

  const user = await User.findById(targetUserId, 'startDate endDate username')
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Prefer the stored onboarding dates; fall back to inferring the range from
  // the user's existing day entries (useful for admin accounts that skipped onboarding)
  let rangeStart: string = user.startDate || ''
  let rangeEnd: string = user.endDate || ''

  if (!rangeStart || !rangeEnd) {
    const [first, last] = await Promise.all([
      Day.findOne({ userId: targetUserId }).sort({ date: 1 }).select('date'),
      Day.findOne({ userId: targetUserId }).sort({ date: -1 }).select('date'),
    ])
    if (!first || !last) {
      return NextResponse.json(
        { error: 'No date range available — set startDate/endDate in your profile first' },
        { status: 400 },
      )
    }
    rangeStart = first.date
    rangeEnd = last.date
  }

  const seeded = await seedDaysForUser(targetUserId, rangeStart, rangeEnd)

  return NextResponse.json({ seeded, username: user.username, rangeStart, rangeEnd })
}
