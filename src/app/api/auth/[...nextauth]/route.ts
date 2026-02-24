import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force Node.js runtime — required for bcrypt + MongoDB, prevents static
// optimisation that strips the POST handler and causes 405 on credentials callback
export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
