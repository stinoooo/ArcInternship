import { getServerSession } from 'next-auth'
import { authOptions, canViewAllUsers } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { cookies } from 'next/headers'
import { SettingsClient } from '@/components/SettingsClient'
import { IUser } from '@/types'
import crypto from 'crypto'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as { role?: string; id?: string }

  // Teachers and admins can access settings
  if (!user?.role || !canViewAllUsers(user.role)) redirect('/dashboard')

  // Language: DB is authoritative, cookie is fallback only
  let lang = 'nl'
  await connectToDatabase()

  let currentUserInviteCode = ''
  try {
    const dbUser = await User.findById(user?.id)
    if (dbUser?.language) {
      lang = dbUser.language
    } else {
      const cookieStore = cookies()
      const cookieLang = cookieStore.get('lang')?.value
      if (cookieLang && ['nl', 'en'].includes(cookieLang)) lang = cookieLang
    }

    // Ensure the current user has an invite code; generate one if missing
    if (dbUser?.inviteCode) {
      currentUserInviteCode = dbUser.inviteCode
    } else if (dbUser) {
      currentUserInviteCode = crypto.randomBytes(8).toString('hex')
      await User.findByIdAndUpdate(user?.id, { inviteCode: currentUserInviteCode })
    }
  } catch (_e) {
    const cookieStore = cookies()
    const cookieLang = cookieStore.get('lang')?.value
    if (cookieLang && ['nl', 'en'].includes(cookieLang)) lang = cookieLang
  }

  const users = await User.find({}, '-password').sort({ createdAt: 1 }).lean()

  return (
    <SettingsClient
      users={users as unknown as IUser[]}
      lang={lang}
      currentUserId={user?.id || ''}
      currentUserRole={user?.role || 'guest'}
      currentUserInviteCode={currentUserInviteCode}
    />
  )
}
