import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Changelog from '@/lib/models/Changelog'
import { CHANGELOG_HISTORY } from '@/lib/changelog-history'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectToDatabase()

    let entries = await Changelog.find({}).sort({ date: -1, version: -1 }).lean()

    // Auto-seed on first use: if DB is empty, upsert all history entries
    if (entries.length === 0) {
      for (const entry of CHANGELOG_HISTORY) {
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
