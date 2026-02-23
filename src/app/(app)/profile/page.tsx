import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { cookies } from 'next/headers'
import { ProfileClient } from '@/components/ProfileClient'
import { IUser } from '@/types'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const sessionUser = session?.user as { id?: string; role?: string }

  // Language: DB is authoritative, cookie is fallback only
  let lang = 'nl'
  let user: IUser | null = null
  try {
    await connectToDatabase()
    const dbUser = await User.findById(sessionUser?.id, '-password')
    if (dbUser) {
      user = dbUser.toObject() as unknown as IUser
      if (user.language) lang = user.language
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

  return (
    <ProfileClient
      user={user}
      lang={lang}
    />
  )
}
