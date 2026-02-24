'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { VersionUpdateBanner } from '@/components/VersionUpdateBanner'
import { ChangelogModal } from '@/components/ChangelogModal'
import { translations } from '@/i18n/translations'

const SEEN_VERSION_KEY = 'arc:seen-version'

interface AppLayoutProps {
  children: React.ReactNode
  lang: string
}

export function AppLayout({ children, lang }: AppLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = translations[lang as 'nl' | 'en'] || translations.nl

  // Version state for footer display
  const [appVersion, setAppVersion] = useState<string | null>(null)
  const [pendingVersion, setPendingVersion] = useState<string | null>(null)

  // Changelog / What's New
  const [showChangelog, setShowChangelog] = useState(false)
  const [whatsNewVersion, setWhatsNewVersion] = useState<string | null>(null)

  // Detect "What's New" once the current version is known
  const handleVersionLoaded = useCallback((version: string) => {
    setAppVersion(version)
    try {
      const seen = localStorage.getItem(SEEN_VERSION_KEY)
      if (seen === null) {
        // First visit — just record the version, don't show modal
        localStorage.setItem(SEEN_VERSION_KEY, version)
      } else if (seen !== version) {
        // User returned after an update — show What's New
        setWhatsNewVersion(version)
        setShowChangelog(true)
        localStorage.setItem(SEEN_VERSION_KEY, version)
      }
    } catch {}
  }, [])

  const handleUpdateDetected = useCallback((toVersion: string) => {
    setPendingVersion(toVersion)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-arc-blue/30 border-t-arc-blue rounded-full animate-spin" />
          <span className="text-[var(--text-muted)] text-sm">{t.loading}</span>
        </div>
      </div>
    )
  }

  if (!session) return null

  const isUpToDate = !pendingVersion
  const displayVersion = appVersion ?? null

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
          {/* Top row: brand + version status + changelog */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <p className="text-xs text-[var(--text-muted)] text-center">
              {t.footerText}
            </p>
            {displayVersion && (
              <span className="flex items-center gap-1 text-xs font-mono">
                {isUpToDate ? (
                  <span className="flex items-center gap-1 text-emerald-500/80">
                    <CheckCircle2 size={11} />
                    {t.versionUpToDate} (v{displayVersion})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-500/80">
                    <AlertCircle size={11} />
                    {t.versionUpdateAvailableFooter}: v{pendingVersion}
                  </span>
                )}
              </span>
            )}
            <button
              onClick={() => { setWhatsNewVersion(null); setShowChangelog(true) }}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-arc-blue transition-colors"
              title={t.changelogTitle}
            >
              <Sparkles size={11} />
              {t.changelogButton}
            </button>
          </div>

          {/* Bottom row: legal links */}
          <div className="flex items-center justify-center gap-3 mt-1">
            <Link href="/privacy" className="text-xs text-[var(--text-muted)] hover:text-arc-blue transition-colors">
              Privacy
            </Link>
            <span className="text-[var(--border)]">·</span>
            <Link href="/terms" className="text-xs text-[var(--text-muted)] hover:text-arc-blue transition-colors">
              Terms
            </Link>
            <span className="text-[var(--border)]">·</span>
            <Link href="/use" className="text-xs text-[var(--text-muted)] hover:text-arc-blue transition-colors">
              Use
            </Link>
          </div>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav lang={lang} session={session} />

      {/* Version update banner (polls every 5 min, only acts on real version diff) */}
      <VersionUpdateBanner
        lang={lang}
        onVersionLoaded={handleVersionLoaded}
        onUpdateDetected={handleUpdateDetected}
      />

      {/* Changelog / What's New modal */}
      {showChangelog && (
        <ChangelogModal
          lang={lang}
          whatsNewVersion={whatsNewVersion}
          onClose={() => { setShowChangelog(false); setWhatsNewVersion(null) }}
        />
      )}
    </div>
  )
}
