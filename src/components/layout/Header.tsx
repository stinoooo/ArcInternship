'use client'

import { Session } from 'next-auth'
import { useTheme } from 'next-themes'
import { Sun, Moon, Globe } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface HeaderProps {
  lang: string
  session: Session
}

export function Header({ lang, session }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const toggleLanguage = async () => {
    const newLang = lang === 'nl' ? 'en' : 'nl'
    const userId = (session.user as { id?: string }).id
    if (userId) {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLang }),
      })
      startTransition(() => router.refresh())
    }
    // Also store in cookie for immediate use
    document.cookie = `lang=${newLang}; path=/; max-age=31536000`
    window.location.reload()
  }

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    const userId = (session.user as { id?: string }).id
    if (userId) {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      })
    }
  }

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium">
          Stage Uren Registratie
        </span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-xs text-arc-blue font-semibold">9 feb – 10 jul 2026</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] border border-[var(--border)]'
          )}
          title={lang === 'nl' ? 'Switch to English' : 'Wissel naar Nederlands'}
        >
          <Globe size={14} />
          {lang === 'nl' ? 'EN' : 'NL'}
        </button>
        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-lg transition-all',
            'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] border border-[var(--border)]'
          )}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}
