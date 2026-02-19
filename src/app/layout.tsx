import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'ArcInternship – Stage Uren Registratie',
  description: 'Stage uren registratie voor ArcNode & Stinoo Network',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
