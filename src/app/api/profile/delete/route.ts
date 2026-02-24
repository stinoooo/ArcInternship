import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import Day from '@/lib/models/Day'

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { id?: string }
  if (!sessionUser.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectToDatabase()
  await Day.deleteMany({ userId: sessionUser.id })
  await User.findByIdAndDelete(sessionUser.id)

  return NextResponse.json({ success: true })
}
