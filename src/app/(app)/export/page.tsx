import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { cookies } from 'next/headers'
import { ExportClient } from '@/components/ExportClient'

export default async function ExportPage() {
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

  return <ExportClient lang={lang} />
}
