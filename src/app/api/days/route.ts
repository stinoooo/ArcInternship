import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, canViewAllUsers, canEditOwnDays } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { id?: string; role?: string }
  const role = sessionUser.role ?? 'guest'

  await connectToDatabase()
  const url = new URL(req.url)
  const type = url.searchParams.get('type')
  const search = url.searchParams.get('search')
  const completed = url.searchParams.get('completed')

  // Teachers/admins can view any student via ?userId=; students always see their own
  let targetUserId: string | null = null
  if (canViewAllUsers(role)) {
    targetUserId = url.searchParams.get('userId')
  } else {
    targetUserId = sessionUser.id ?? null
  }

  const query: Record<string, unknown> = {}
  if (targetUserId) {
    query.userId = targetUserId
  } else {
    // Admin viewing without a userId filter: show unowned legacy days
    query.userId = { $exists: false }
  }

  if (type && type !== 'all') query.type = type
  if (completed === 'true') query.isComplete = true
  if (search) query.date = { $regex: search }

  const days = await Day.find(query).sort({ date: 1 })
  return NextResponse.json(days)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { id?: string; role?: string }
  const role = sessionUser.role ?? 'guest'

  if (!canEditOwnDays(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectToDatabase()
  const body = await req.json()

  // Admin can specify a target userId; students always create for themselves
  const userId =
    role === 'admin' && body.userId ? body.userId : sessionUser.id

  const day = await Day.create({ ...body, userId })
  return NextResponse.json(day, { status: 201 })
}
