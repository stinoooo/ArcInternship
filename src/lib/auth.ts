import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from './mongodb'
import User from './models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectToDatabase()
        const user = await User.findOne({ email: credentials.email.toLowerCase() })
        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          role: user.role,
          language: user.language,
          theme: user.theme,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role: string; language: string; theme: string }
        token.role = u.role
        token.language = u.language
        token.theme = u.theme
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string; language?: string; theme?: string }).id = token.sub
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { language?: string }).language = token.language as string
        ;(session.user as { theme?: string }).theme = token.theme as string
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
