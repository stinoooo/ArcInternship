import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/api/auth', '/api/register', '/_next', '/favicon', '/bluelogo', '/whitelogo']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow onboarding page itself to avoid infinite redirect
  if (pathname === '/onboarding') {
    return NextResponse.next()
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Only check onboarding for app routes
  if (!pathname.startsWith('/dashboard') &&
      !pathname.startsWith('/days') &&
      !pathname.startsWith('/export') &&
      !pathname.startsWith('/settings') &&
      !pathname.startsWith('/profile')) {
    return NextResponse.next()
  }

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.next() // Auth is handled by layout

    const role = token.role as string
    const onboardingCompleted = token.onboardingCompleted

    // Admins and teachers skip onboarding
    if (role === 'admin' || role === 'teacher') return NextResponse.next()

    // If onboardingCompleted is explicitly false (not undefined), redirect to onboarding
    if (onboardingCompleted === false) {
      const onboardingUrl = new URL('/onboarding', req.url)
      return NextResponse.redirect(onboardingUrl)
    }
  } catch {
    // Token error, let auth handle it
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
