import { NextResponse } from 'next/server'

// Server start time — changes on every restart/deployment
const SERVER_START_TIME = Date.now()
const APP_VERSION = process.env.npm_package_version || '1.0.0'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    version: APP_VERSION,
    buildId: SERVER_START_TIME,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}
