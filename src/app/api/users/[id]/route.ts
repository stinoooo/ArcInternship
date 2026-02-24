import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, canApproveUsers, canDeleteUsers, canManageRoles, canViewAllUsers } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import { seedDaysForUser } from '@/lib/seedDays'

// Fields a user can update on their own account (non-privileged)
const SELF_ALLOWED_FIELDS = [
  'language', 'theme',
  // Onboarding fields
  'internshipPlace', 'schoolName', 'studentEmail',
  'requiredHours', 'startDate', 'endDate',
  'supervisorContact', 'onboardingCompleted',
]

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { role?: string; id?: string }
  if (!sessionUser.role || !canDeleteUsers(sessionUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Prevent self-deletion
  if (sessionUser.id === params.id) {
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

  const sessionUser = session.user as { role?: string; id?: string }
  const isAdmin = sessionUser.role === 'admin'
  const isTeacher = sessionUser.role === 'teacher'
  const isOwnAccount = sessionUser.id === params.id

  // Must be admin, teacher, or updating own account
  if (!isAdmin && !isTeacher && !isOwnAccount) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectToDatabase()
  const body = await req.json()
  const { password: _pw, newPassword, ...safeBody } = body

  // Teachers can only approve users (limited to approved field)
  if (isTeacher && !isOwnAccount) {
    if (!canApproveUsers(sessionUser.role!)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // Teachers can only set approved = true (not false, and not other fields)
    const allowed: Record<string, unknown> = {}
    if ('approved' in safeBody && safeBody.approved === true) {
      allowed.approved = true
    } else {
      return NextResponse.json({ error: 'Teachers can only approve accounts' }, { status: 403 })
    }
    const user = await User.findByIdAndUpdate(params.id, allowed, { new: true })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...user.toObject(), password: undefined })
  }

  // Own account (non-admin): can only update whitelisted self fields
  if (!isAdmin && isOwnAccount) {
    const filtered: Record<string, unknown> = {}
    for (const key of SELF_ALLOWED_FIELDS) {
      if (key in safeBody) filtered[key] = safeBody[key]
    }

    // Validate language/theme
    if (filtered.language && !['nl', 'en'].includes(filtered.language as string)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    }
    if (filtered.theme && !['light', 'dark'].includes(filtered.theme as string)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    }
    // Validate onboarding fields
    if (filtered.requiredHours !== undefined) {
      const h = Number(filtered.requiredHours)
      if (isNaN(h) || h <= 0) {
        return NextResponse.json({ error: 'Invalid hours' }, { status: 400 })
      }
      filtered.requiredHours = h
    }
    if (filtered.startDate && filtered.endDate) {
      const start = new Date(filtered.startDate as string)
      const end = new Date(filtered.endDate as string)
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
      }
    }
    if (filtered.studentEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(filtered.studentEmail as string)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
      }
    }

    const user = await User.findByIdAndUpdate(params.id, filtered, { new: true })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Auto-seed weekday Day records when onboarding completes or internship dates change
    const triggersSeed = 'onboardingCompleted' in filtered || 'startDate' in filtered || 'endDate' in filtered
    if (triggersSeed && user.onboardingCompleted && user.startDate && user.endDate) {
      try {
        await seedDaysForUser(params.id, user.startDate, user.endDate)
      } catch (e) {
        console.error('[ArcInternship] seedDaysForUser failed (non-fatal):', e)
      }
    }

    return NextResponse.json({ ...user.toObject(), password: undefined })
  }

  // Admins: full update capability
  const updateBody = { ...safeBody }

  // Prevent non-admins from changing roles
  if ('role' in updateBody && !canManageRoles(sessionUser.role!)) {
    return NextResponse.json({ error: 'Cannot change roles' }, { status: 403 })
  }

  // Admin can reset a user's password
  if (newPassword && isAdmin) {
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    updateBody.password = await bcrypt.hash(newPassword, 12)
  }

  const user = await User.findByIdAndUpdate(params.id, updateBody, { new: true })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ...user.toObject(), password: undefined })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionUser = session.user as { role?: string; id?: string }
  const canViewAll = sessionUser.role ? canViewAllUsers(sessionUser.role) : false
  const isOwnAccount = sessionUser.id === params.id

  if (!canViewAll && !isOwnAccount) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectToDatabase()
  const user = await User.findById(params.id, '-password')
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(user)
}
