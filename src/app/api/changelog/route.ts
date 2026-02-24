import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Changelog from '@/lib/models/Changelog'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectToDatabase()
    const entries = await Changelog.find({})
      .sort({ date: -1, version: -1 })
      .lean()
    return NextResponse.json(entries, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
