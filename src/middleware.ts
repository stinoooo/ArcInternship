import { NextRequest, NextResponse } from 'next/server'

// Auth is handled by the (app) layout — redirect to /login if no session.
// No onboarding redirect: guest accounts go straight to the app.
export async function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
