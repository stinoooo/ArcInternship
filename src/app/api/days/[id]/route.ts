import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions, canEditDays, canEditOwnDays } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { id?: string; role?: string }
  const role = sessionUser.role ?? 'guest'

  if (!canEditOwnDays(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectToDatabase()

  // Students can only edit their own days
  if (!canEditDays(role)) {
    const existing = await Day.findById(params.id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.userId?.toString() !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const body = await req.json()

  // Force hours to 0 for non-work day types
  const noHoursTypes = ['vrij', 'ziek', 'feestdag']
  if (body.type && noHoursTypes.includes(body.type)) {
    body.hours = 0
  }

  const day = await Day.findByIdAndUpdate(params.id, body, { new: true })
  if (!day) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  revalidatePath('/dashboard')
  revalidatePath('/days')

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
