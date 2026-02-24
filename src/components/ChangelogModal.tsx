'use client'

import { useEffect, useState, useRef } from 'react'
import { X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { translations } from '@/i18n/translations'
import { cn } from '@/lib/utils'

const READ_KEY = 'arc:changelog:read'

interface ChangelogEntry {
  _id?: string
  version: string
  date: string
  nl: string[]
  en: string[]
}

interface Props {
  lang: string
  onClose: () => void
  /** If set, the modal opens in "What's New" mode: scrolls to this version. */
  whatsNewVersion?: string | null
}

function getReadVersions(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch {}
  return new Set()
}

function markRead(versions: string[]) {
  try {
    const existing = getReadVersions()
    versions.forEach(v => existing.add(v))
    localStorage.setItem(READ_KEY, JSON.stringify([...existing]))
  } catch {}
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const diff = (pb[i] ?? 0) - (pa[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

export function ChangelogModal({ lang, onClose, whatsNewVersion }: Props) {
  const t = translations[lang as 'nl' | 'en'] || translations.nl
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [readVersions, setReadVersions] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const whatsNewRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setReadVersions(getReadVersions())

    fetch('/api/changelog', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then((data: ChangelogEntry[]) => {
        const sorted = [...data].sort((a, b) => compareVersions(a.version, b.version))
        setEntries(sorted)

        // Expand the latest version (or whatsNew target) by default
        const target = whatsNewVersion ?? sorted[0]?.version
        if (target) setExpanded(new Set([target]))

        // Mark all currently loaded versions as read
        markRead(sorted.map(e => e.version))
        setReadVersions(getReadVersions())
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll to "What's New" version after render
  useEffect(() => {
    if (!loading && whatsNewRef.current) {
      whatsNewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loading])

  const toggleExpand = (version: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(version) ? next.delete(version) : next.add(version)
      return next
    })
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00')
      return d.toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const isUnread = (version: string) => !readVersions.has(version)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.changelogTitle}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg max-h-[80vh] flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-arc-blue" />
            <h2 className="font-bold text-[var(--text-primary)] text-base">
              {whatsNewVersion ? t.whatsNew : t.changelogTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Sluiten"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-arc-blue/30 border-t-arc-blue rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              {t.changelogEmpty}
            </p>
          ) : (
            entries.map(entry => {
              const isOpen = expanded.has(entry.version)
              const unread = isUnread(entry.version)
              const isTarget = entry.version === whatsNewVersion
              const items = lang === 'nl' ? entry.nl : entry.en

              return (
                <div
                  key={entry.version}
                  ref={isTarget ? whatsNewRef : undefined}
                  className={cn(
                    'rounded-xl border transition-colors',
                    isTarget
                      ? 'border-arc-blue/40 bg-arc-blue/5'
                      : 'border-[var(--border)] bg-[var(--bg-secondary)]'
                  )}
                >
                  <button
                    onClick={() => toggleExpand(entry.version)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        'font-mono font-bold text-sm',
                        isTarget ? 'text-arc-blue' : 'text-[var(--text-primary)]'
                      )}>
                        v{entry.version}
                      </span>
                      {unread && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-arc-blue text-arc-navy uppercase tracking-wide flex-shrink-0">
                          {t.changelogNew}
                        </span>
                      )}
                      {isTarget && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-arc-blue/15 text-arc-blue uppercase tracking-wide flex-shrink-0">
                          <Sparkles size={9} />
                          {lang === 'nl' ? 'nieuw' : "new"}
                        </span>
                      )}
                      <span className="text-xs text-[var(--text-muted)] ml-1 truncate">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <div className="flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors ml-2">
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {isOpen && items.length > 0 && (
                    <ul className="px-4 pb-3 space-y-1.5">
                      {items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-arc-blue flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
