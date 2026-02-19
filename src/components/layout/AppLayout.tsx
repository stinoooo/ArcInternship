'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

interface AppLayoutProps {
  children: React.ReactNode
  lang: string
}

export function AppLayout({ children, lang }: AppLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-arc-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-muted)] text-sm">Laden...</span>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar lang={lang} session={session} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header lang={lang} session={session} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-24 md:pb-6">
          {children}
        </main>
        <footer className="hidden md:block px-6 py-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-xs text-[var(--text-muted)] text-center">
            Part of the ArcNode Network & Stinoo Network
          </p>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav lang={lang} session={session} />
    </div>
  )
}
