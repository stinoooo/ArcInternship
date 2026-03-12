import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { resyncDaysForUser } from '@/lib/migrations'

export async function POST() {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as { role?: string } | undefined
  if (!session || sessionUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectToDatabase()

  const users = await User.find({
    startDate: { $exists: true, $ne: '' },
    endDate:   { $exists: true, $ne: '' },
  }).lean()

  let totalDeleted = 0, totalInserted = 0, errors = 0

  for (const user of users) {
    if (!user.startDate || !user.endDate) continue
    try {
      const result = await resyncDaysForUser(String(user._id), user.startDate, user.endDate)
      totalDeleted  += result.deleted
      totalInserted += result.inserted
    } catch {
      errors++
    }
  }

  return NextResponse.json({
    users: users.length,
    deleted: totalDeleted,
    inserted: totalInserted,
    errors,
  })
}
