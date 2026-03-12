import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { resyncDaysForUser } from '@/lib/migrations'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as { id?: string; role?: string } | undefined
  if (!session || sessionUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectToDatabase()

  // Optional date-range override supplied by the admin UI
  const body = await req.json().catch(() => ({}))
  const overrideStart: string = body.startDate || ''
  const overrideEnd: string   = body.endDate   || ''

  // All users — those without stored dates will use the override if provided
  const users = await User.find({}).lean()

  let totalDeleted = 0, totalInserted = 0, totalFailed = 0, errors = 0, processed = 0

  for (const user of users) {
    // Override dates (entered by admin) take priority over stored dates.
    // Fall back to stored dates only when no override was provided.
    const startDate = overrideStart || user.startDate || ''
    const endDate   = overrideEnd   || user.endDate   || ''

    // Skip users with no usable date range
    if (!startDate || !endDate) continue

    processed++
    try {
      const result = await resyncDaysForUser(String(user._id), startDate, endDate)
      totalDeleted  += result.deleted
      totalInserted += result.inserted
      totalFailed   += result.failed ?? 0
    } catch {
      errors++
    }
  }

  return NextResponse.json({
    users: processed,
    deleted: totalDeleted,
    inserted: totalInserted,
    failed: totalFailed,
    errors,
  })
}
