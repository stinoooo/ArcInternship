import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export default async function AppRootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Get user language: DB is authoritative, cookie is fallback only
  let lang = 'nl'
  try {
    await connectToDatabase()
    const userId = (session.user as { id?: string }).id
    if (userId) {
      const user = await User.findById(userId)
      if (user?.language) {
        lang = user.language
      } else {
        // DB lookup succeeded but no language set — check cookie as fallback
        const cookieStore = cookies()
        const cookieLang = cookieStore.get('lang')?.value
        if (cookieLang && ['nl', 'en'].includes(cookieLang)) lang = cookieLang
      }
    }
  } catch (_e) {
    // DB unreachable — fall back to cookie
    const cookieStore = cookies()
    const cookieLang = cookieStore.get('lang')?.value
    if (cookieLang && ['nl', 'en'].includes(cookieLang)) lang = cookieLang
  }

  return <AppLayout lang={lang}>{children}</AppLayout>
}
