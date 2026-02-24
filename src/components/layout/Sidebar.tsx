'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'
import { LayoutDashboard, CalendarDays, Download, Settings, LogOut, User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { translations } from '@/i18n/translations'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface SidebarProps {
  lang: string
  session: Session
}

export function Sidebar({ lang, session }: SidebarProps) {
  const pathname = usePathname()
  const t = translations[lang as 'nl' | 'en'] || translations.nl
  const user = session.user as { role?: string }
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    fetch('/api/profile/avatar', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.avatarUrl && setAvatarUrl(d.avatarUrl))
      .catch(() => {})
  }, [])

  const navItems = [
    { href: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { href: '/days', label: t.days, icon: CalendarDays },
    { href: '/export', label: t.exportPage, icon: Download },
    ...(user.role === 'admin' || user.role === 'teacher' ? [{ href: '/settings', label: t.settings, icon: Settings }] : []),
    { href: '/profile', label: t.profile, icon: User },
  ]

  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 bg-[var(--bg-card)] border-r border-[var(--border)] flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <Image src="/bluelogo.svg" alt={t.app} width={32} height={32} />
          <div>
            <h1 className="font-bold text-sm text-[var(--text-primary)]">{t.app}</h1>
            <p className="text-xs text-[var(--text-muted)]">{t.appSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-arc-blue/15 text-arc-blue'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-arc-blue/20 border border-arc-blue/30 overflow-hidden flex items-center justify-center text-arc-blue text-sm font-bold flex-shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={session.user?.name || ''} className="w-full h-full object-cover" />
            ) : (
              session.user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{session.user?.name}</p>
            <p className="text-xs text-[var(--text-muted)] capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={18} />
          {t.logout}
        </button>
      </div>
    </aside>
  )
}
