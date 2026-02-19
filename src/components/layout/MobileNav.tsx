'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'
import { LayoutDashboard, CalendarDays, Download, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { translations } from '@/i18n/translations'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  lang: string
  session: Session
}

export function MobileNav({ lang, session }: MobileNavProps) {
  const pathname = usePathname()
  const t = translations[lang as 'nl' | 'en'] || translations.nl
  const user = session.user as { role?: string }

  const navItems = [
    { href: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { href: '/days', label: t.days, icon: CalendarDays },
    { href: '/export', label: t.exportPage, icon: Download },
    ...(user.role === 'admin' ? [{ href: '/settings', label: t.settings, icon: Settings }] : []),
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
              isActive
                ? 'text-arc-blue'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium text-[var(--text-muted)] hover:text-red-500 transition-colors"
      >
        <LogOut size={20} />
        <span>{t.logout}</span>
      </button>
    </nav>
  )
}
