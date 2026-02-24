import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Changelog from '@/lib/models/Changelog'
import { CHANGELOG_HISTORY } from '@/lib/changelog-history'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const user = session?.user as { role?: string } | undefined
  if (!session || user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const adminKey = process.env.ADMIN_SEED_KEY
  if (adminKey && body?.key !== adminKey && user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await connectToDatabase()

    const results: string[] = []
    for (const entry of CHANGELOG_HISTORY) {
      await Changelog.findOneAndUpdate(
        { version: entry.version },
        { $set: entry },
        { upsert: true, new: true }
      )
      results.push(entry.version)
    }

    return NextResponse.json({ success: true, seeded: results, count: results.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
