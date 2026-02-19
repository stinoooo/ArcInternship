import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { cookies } from 'next/headers'
import { SettingsClient } from '@/components/SettingsClient'
import { IUser } from '@/types'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { role?: string; id?: string }

  if (user?.role !== 'admin') redirect('/dashboard')

  const cookieStore = cookies()
  let lang = cookieStore.get('lang')?.value || 'nl'

  await connectToDatabase()

  try {
    const dbUser = await User.findById(user?.id)
    if (dbUser?.language) lang = dbUser.language
  } catch (_e) {}

  const users = await User.find({}, '-password').sort({ createdAt: 1 }).lean()

  return (
    <SettingsClient
      users={users as unknown as IUser[]}
      lang={lang}
      currentUserId={user?.id || ''}
    />
  )
}
