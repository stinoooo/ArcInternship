import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Changelog from '@/lib/models/Changelog'
import { CHANGELOG_HISTORY } from '@/lib/changelog-history'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectToDatabase()

    let entries = await Changelog.find({}).sort({ date: -1, version: -1 }).lean()

    // Sync any missing entries from CHANGELOG_HISTORY into the DB
    const dbVersions = new Set(entries.map((e: { version: string }) => e.version))
    const missing = CHANGELOG_HISTORY.filter(e => !dbVersions.has(e.version))
    if (missing.length > 0) {
      for (const entry of missing) {
        await Changelog.findOneAndUpdate(
          { version: entry.version },
          { $set: entry },
          { upsert: true, new: true }
        )
      }
      entries = await Changelog.find({}).sort({ date: -1, version: -1 }).lean()
    }

    return NextResponse.json(entries, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
