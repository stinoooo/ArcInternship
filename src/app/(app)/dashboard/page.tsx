import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Day from '@/lib/models/Day'
import User from '@/lib/models/User'
import { cookies } from 'next/headers'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { IDay } from '@/types'

const TARGET_HOURS = 760

async function getDashboardData() {
  await connectToDatabase()
  const days = await Day.find({}).sort({ date: 1 }).lean()
  return days as unknown as IDay[]
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const cookieStore = cookies()
  let lang = cookieStore.get('lang')?.value || 'nl'

  try {
    await connectToDatabase()
    const userId = (session?.user as { id?: string })?.id
    if (userId) {
      const user = await User.findById(userId)
      if (user?.language) lang = user.language
    }
  } catch (_e) {}

  const days = await getDashboardData()

  const noHoursTypes = ['vrij', 'ziek', 'feestdag']
  const completedDays = days.filter(d => d.isComplete)
  const completedHours = completedDays.reduce(
    (sum, d) => sum + (noHoursTypes.includes(d.type) ? 0 : d.hours),
    0
  )
  const remainingHours = Math.max(0, TARGET_HOURS - completedHours)
  const percentage = Math.min(100, Math.round((completedHours / TARGET_HOURS) * 100))
  const totalWorkdays = days.length
  const remainingDays = days.filter(d => !d.isComplete).length

  // Group by week
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
    totalHours: TARGET_HOURS,
    completedHours,
    remainingHours,
    percentage,
    completedDays: completedDays.length,
    totalWorkdays,
    remainingDays,
    weeks,
  }

  return <DashboardClient stats={stats} days={days} lang={lang} />
}
