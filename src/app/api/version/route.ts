import { NextResponse } from 'next/server'
import { version } from '../../../../package.json'

// Server start time — changes on every restart/deployment
const SERVER_START_TIME = Date.now()
const APP_VERSION = version

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
