import { NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../../../package.json') as { version: string }

// Server start time — changes on every restart/deployment
const SERVER_START_TIME = Date.now()
const APP_VERSION: string = pkg.version

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
