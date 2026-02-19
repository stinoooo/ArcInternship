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
  const cookieStore = cookies()
  let lang = cookieStore.get('lang')?.value || 'nl'
  const userRole = (session?.user as { role?: string })?.role || 'guest'

  try {
    await connectToDatabase()
    const userId = (session?.user as { id?: string })?.id
    if (userId) {
      const user = await User.findById(userId)
      if (user?.language) lang = user.language
    }
  } catch (_e) {}

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
