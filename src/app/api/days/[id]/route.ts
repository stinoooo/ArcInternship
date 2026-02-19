import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as { role?: string }
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectToDatabase()
  const body = await req.json()

  const day = await Day.findByIdAndUpdate(params.id, body, { new: true })
  if (!day) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(day)
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectToDatabase()
  const day = await Day.findById(params.id)
  if (!day) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(day)
}
