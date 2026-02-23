import { getServerSession } from 'next-auth'
import { authOptions, canViewAllUsers } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'
import User from '@/lib/models/User'
import { cookies } from 'next/headers'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { IDay, IUser } from '@/types'

const DEFAULT_TARGET_HOURS = 760

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { student?: string }
}) {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as { id?: string; role?: string }
  const role = sessionUser?.role ?? 'guest'
  const sessionUserId = sessionUser?.id ?? ''
  const isTeacherOrAdmin = canViewAllUsers(role)

  await connectToDatabase()

  // Resolve language from DB
  let lang = 'nl'
  try {
    const dbUser = await User.findById(sessionUserId)
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

  // Determine which student's data to show
  let students: IUser[] = []
  let targetUserId = sessionUserId
  let targetStudent: IUser | null = null

  if (isTeacherOrAdmin) {
    const rawStudents = await User.find(
      { approved: true, role: { $in: ['student', 'guest'] } },
      '-password'
    ).sort({ username: 1 }).lean()
    students = rawStudents as unknown as IUser[]

    if (searchParams?.student && students.some(s => s._id.toString() === searchParams.student)) {
      targetUserId = searchParams.student!
    } else if (students.length > 0) {
      // Default to first student
      targetUserId = students[0]._id.toString()
    }

    targetStudent = students.find(s => s._id.toString() === targetUserId) ?? null
  } else {
    // Students view their own data; load their own profile for requiredHours etc.
    const self = await User.findById(sessionUserId, '-password').lean()
    targetStudent = self as unknown as IUser | null
  }

  const targetHours = targetStudent?.requiredHours ?? DEFAULT_TARGET_HOURS

  // Load this student's days
  const days = await Day.find({ userId: targetUserId }).sort({ date: 1 }).lean() as unknown as IDay[]

  const noHoursTypes = ['vrij', 'ziek', 'feestdag']
  const completedDays = days.filter(d => d.isComplete)
  const completedHours = completedDays.reduce(
    (sum, d) => sum + (noHoursTypes.includes(d.type) ? 0 : d.hours),
    0
  )
  const remainingHours = Math.max(0, targetHours - completedHours)
  const percentage = Math.min(100, Math.round((completedHours / targetHours) * 100))
  const totalWorkdays = days.length
  const remainingDays = days.filter(d => !d.isComplete).length

  const weekMap = new Map<number, IDay[]>()
  days.forEach(day => {
    const key = day.weekNumber
    if (!weekMap.has(key)) weekMap.set(key, [])
    weekMap.get(key)!.push(day)
  })

  const weeks = Array.from(weekMap.entries()).map(([weekNumber, weekDays]) => ({
    weekNumber,
    year: weekDays[0].year,
    days: weekDays,
    totalHours: weekDays.filter(d => d.isComplete).reduce(
      (sum, d) => sum + (noHoursTypes.includes(d.type) ? 0 : d.hours),
      0
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
      students={students}
      selectedStudentId={targetUserId}
      selectedStudent={targetStudent}
      isTeacherOrAdmin={isTeacherOrAdmin}
    />
  )
}
