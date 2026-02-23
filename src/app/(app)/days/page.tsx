import { getServerSession } from 'next-auth'
import { authOptions, canViewAllUsers } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'
import User from '@/lib/models/User'
import { cookies } from 'next/headers'
import { DaysClient } from '@/components/days/DaysClient'
import { IDay, IUser } from '@/types'

export default async function DaysPage({
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

  // Language: DB is authoritative, cookie is fallback only
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
  let targetStudentName = ''

  if (isTeacherOrAdmin) {
    const rawStudents = await User.find(
      { approved: true, role: { $in: ['student', 'guest'] } },
      '-password'
    ).sort({ username: 1 }).lean()
    students = rawStudents as unknown as IUser[]

    if (searchParams?.student && students.some(s => s._id.toString() === searchParams.student)) {
      targetUserId = searchParams.student!
    } else if (students.length > 0) {
      targetUserId = students[0]._id.toString()
    }

    const found = students.find(s => s._id.toString() === targetUserId)
    targetStudentName = found?.username ?? ''
  }

  const days = await Day.find({ userId: targetUserId }).sort({ date: 1 }).lean()

  // Students can edit their own days; teachers are read-only
  const canEdit = role === 'admin' || (role === 'student' && targetUserId === sessionUserId)

  return (
    <DaysClient
      initialDays={days as unknown as IDay[]}
      lang={lang}
      canEdit={canEdit}
      students={students}
      selectedStudentId={targetUserId}
      viewingStudentName={isTeacherOrAdmin ? targetStudentName : ''}
      isTeacherOrAdmin={isTeacherOrAdmin}
    />
  )
}
