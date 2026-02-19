import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as { role?: string; id?: string }
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Prevent self-deletion
  if (user.id === params.id) {
    return NextResponse.json({ error: 'Cannot delete own account' }, { status: 400 })
  }

  await connectToDatabase()
  await User.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { role?: string }
  if (sessionUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectToDatabase()
  const body = await req.json()
  // Strip password from body to prevent accidental overwrites
  const { password: _pw, ...safeBody } = body
  const user = await User.findByIdAndUpdate(params.id, safeBody, { new: true })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ...user.toObject(), password: undefined })
}
