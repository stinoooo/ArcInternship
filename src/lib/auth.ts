import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from './mongodb'
import User from './models/User'
import { checkRateLimit, resetRateLimit } from './rateLimit'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate limiting by email (prevents targeted brute force)
        const email = credentials.email.toLowerCase().trim()
        const rateLimitKey = `login:${email}`
        const { allowed } = checkRateLimit(rateLimitKey)
        if (!allowed) {
          // Return null without revealing it's rate limited (generic error)
          return null
        }

        await connectToDatabase()
        const user = await User.findOne({ email })
        if (!user) {
          // Still check rate limit even for non-existent users (timing attack prevention)
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        if (user.approved === false) return null

        // Successful login - reset rate limit
        resetRateLimit(rateLimitKey)

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          role: user.role,
          language: user.language,
          theme: user.theme,
          onboardingCompleted: user.onboardingCompleted ?? false,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as unknown as {
          role: string
          language: string
          theme: string
          onboardingCompleted: boolean
        }
        token.role = u.role
        token.language = u.language
        token.theme = u.theme
        token.onboardingCompleted = u.onboardingCompleted
      }
      // Handle client-side session.update() calls
      if (trigger === 'update' && session) {
        if (typeof session.onboardingCompleted === 'boolean') {
          token.onboardingCompleted = session.onboardingCompleted
        }
        if (session.language === 'nl' || session.language === 'en') {
          token.language = session.language
        }
        if (session.theme === 'light' || session.theme === 'dark') {
          token.theme = session.theme
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as {
          id?: string
          role?: string
          language?: string
          theme?: string
          onboardingCompleted?: boolean
        }
        u.id = token.sub
        u.role = token.role as string
        u.language = token.language as string
        u.theme = token.theme as string
        u.onboardingCompleted = token.onboardingCompleted as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Server-side RBAC helpers
export type AppRole = 'guest' | 'student' | 'teacher' | 'admin'

export function canEditDays(role: string): boolean {
  return role === 'admin'
}

// Students can create/edit their own day records
export function canEditOwnDays(role: string): boolean {
  return role === 'admin' || role === 'student'
}

export function canViewAllUsers(role: string): boolean {
  return role === 'admin' || role === 'teacher'
}

export function canApproveUsers(role: string): boolean {
  return role === 'admin' || role === 'teacher'
}

export function canManageRoles(role: string): boolean {
  return role === 'admin'
}

export function canDeleteUsers(role: string): boolean {
  return role === 'admin'
}
