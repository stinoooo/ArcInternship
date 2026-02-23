import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, canEditDays } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectToDatabase()
  const url = new URL(req.url)
  const type = url.searchParams.get('type')
  const search = url.searchParams.get('search')
  const completed = url.searchParams.get('completed')

  const query: Record<string, unknown> = {}
  if (type && type !== 'all') query.type = type
  if (completed === 'true') query.isComplete = true
  if (search) query.date = { $regex: search }

  const days = await Day.find(query).sort({ date: 1 })
  return NextResponse.json(days)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as { role?: string }
  if (!canEditDays(user.role ?? '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectToDatabase()
  const body = await req.json()
  const day = await Day.create(body)
  return NextResponse.json(day, { status: 201 })
}
