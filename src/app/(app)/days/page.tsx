import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'
import User from '@/lib/models/User'
import { cookies } from 'next/headers'
import { DaysClient } from '@/components/days/DaysClient'
import { IDay } from '@/types'

export default async function DaysPage() {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as { id?: string; role?: string }
  const role = sessionUser?.role ?? 'guest'
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
  let targetUserId = sessionUserId
  if (role === 'guest' && sessionUserId) {
    try {
      const admin = await User.findOne({ role: 'admin' }, '_id').lean()
      if (admin) targetUserId = (admin._id as unknown as { toString(): string }).toString()
    } catch (_e) { /* fall back to own id */ }
  }

  let days: IDay[] = []
  try {
    if (targetUserId) {
      days = (await Day.find({ userId: targetUserId }).sort({ date: 1 }).lean()) as unknown as IDay[]
    }
  } catch (_e) { /* ignore */ }

  // Only admin can create/edit days
  const canEdit = role === 'admin'

  return (
    <DaysClient
      initialDays={days}
      lang={lang}
      canEdit={canEdit}
      students={[]}
      selectedStudentId={sessionUserId}
      viewingStudentName=""
      isTeacherOrAdmin={false}
    />
  )
}
