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
  const userRole = (session?.user as { role?: string })?.role || 'guest'

  // Language: DB is authoritative, cookie is fallback only
  let lang = 'nl'
  try {
    await connectToDatabase()
    const userId = (session?.user as { id?: string })?.id
    if (userId) {
      const user = await User.findById(userId)
      if (user?.language) {
        lang = user.language
      } else {
        const cookieStore = cookies()
        const cookieLang = cookieStore.get('lang')?.value
        if (cookieLang && ['nl', 'en'].includes(cookieLang)) lang = cookieLang
      }
    }
  } catch (_e) {
    const cookieStore = cookies()
    const cookieLang = cookieStore.get('lang')?.value
    if (cookieLang && ['nl', 'en'].includes(cookieLang)) lang = cookieLang
  }

  await connectToDatabase()
  const days = await Day.find({}).sort({ date: 1 }).lean()

  return (
    <DaysClient
      initialDays={days as unknown as IDay[]}
      lang={lang}
      isAdmin={userRole === 'admin'}
    />
  )
}
