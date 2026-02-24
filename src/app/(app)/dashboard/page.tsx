import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'
import User from '@/lib/models/User'
import { cookies } from 'next/headers'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { IDay, IUser } from '@/types'

const DEFAULT_TARGET_HOURS = 760

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as { id?: string; role?: string }
  const sessionUserId = sessionUser?.id ?? ''

  await connectToDatabase()

  // Language: DB is authoritative, cookie is fallback
  let lang = 'nl'
  try {
    const dbUser = sessionUserId ? await User.findById(sessionUserId) : null
    if (dbUser?.language) {
      lang = dbUser.language
    } else {
      const cookieStore = cookies()
      const cookieLang = cookieStore.get('lang')?.value
      if (cookieLang && ['nl', 'en'].includes(cookieLang)) lang = cookieLang
    }
  } catch (_e) {
    const cookieStore = cookies()
    const cookieLang = cookieStore.get('lang')?.value
    if (cookieLang && ['nl', 'en'].includes(cookieLang)) lang = cookieLang
  }

  // Guests view the admin's data (read-only); all others view their own
  const role = sessionUser?.role ?? 'guest'
  let targetUserId = sessionUserId
  if (role === 'guest' && sessionUserId) {
    try {
      const admin = await User.findOne({ role: 'admin' }, '_id').lean()
      if (admin) targetUserId = (admin._id as unknown as { toString(): string }).toString()
    } catch (_e) { /* fall back to own id */ }
  }

  // Load target user's profile (for requiredHours, name, etc.)
  let targetStudent: IUser | null = null
  try {
    const self = targetUserId ? await User.findById(targetUserId, '-password').lean() : null
    targetStudent = self as unknown as IUser | null
  } catch (_e) { /* ignore */ }

  const targetHours = targetStudent?.requiredHours ?? DEFAULT_TARGET_HOURS

  // Load target user's days
  let days: IDay[] = []
  try {
    if (targetUserId) {
      days = (await Day.find({ userId: targetUserId }).sort({ date: 1 }).lean()) as unknown as IDay[]
    }
  } catch (_e) { /* ignore */ }

  const noHoursTypes = ['vrij', 'ziek', 'feestdag']
  const completedDays = days.filter(d => d.isComplete)
  const completedHours = completedDays.reduce(
    (sum, d) => sum + (noHoursTypes.includes(d.type) ? 0 : d.hours),
    0,
  )
  const remainingHours = Math.max(0, targetHours - completedHours)
  const percentage = Math.min(100, Math.round((completedHours / targetHours) * 100))
  const totalWorkdays = days.length
  const remainingDays = days.filter(d => !d.isComplete).length

  const weekMap = new Map<number, IDay[]>()
  days.forEach(day => {
    if (!weekMap.has(day.weekNumber)) weekMap.set(day.weekNumber, [])
    weekMap.get(day.weekNumber)!.push(day)
  })

  const weeks = Array.from(weekMap.entries()).map(([weekNumber, weekDays]) => ({
    weekNumber,
    year: weekDays[0].year,
    days: weekDays,
    totalHours: weekDays.filter(d => d.isComplete).reduce(
      (sum, d) => sum + (noHoursTypes.includes(d.type) ? 0 : d.hours),
      0,
    ),
    completedDays: weekDays.filter(d => d.isComplete).length,
  }))

  const stats = {
    totalHours: targetHours,
    completedHours,
    remainingHours,
    percentage,
    completedDays: completedDays.length,
    totalWorkdays,
    remainingDays,
    weeks,
  }

  return (
    <DashboardClient
      stats={stats}
      days={days}
      lang={lang}
      students={[]}
      selectedStudentId={sessionUserId}
      selectedStudent={targetStudent}
      isTeacherOrAdmin={false}
    />
  )
}
