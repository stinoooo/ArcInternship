'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { translations } from '@/i18n/translations'
import { cn } from '@/lib/utils'

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes
const COUNTDOWN_SECONDS = 15

interface VersionPayload {
  version: string
  commitSha?: string
  builtAt?: string
}

interface Props {
  lang: string
  onVersionLoaded?: (version: string) => void
  onUpdateDetected?: (toVersion: string) => void
}

export function VersionUpdateBanner({ lang, onVersionLoaded, onUpdateDetected }: Props) {
  const t = translations[lang as 'nl' | 'en'] || translations.nl
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [fromVersion, setFromVersion] = useState<string | null>(null)
  const [toVersion, setToVersion] = useState<string | null>(null)
  const baselineVersion = useRef<string | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const doRefresh = useCallback(() => {
    // Allow form components to save unsaved work before reload
    window.dispatchEvent(new CustomEvent('arc:beforeVersionRefresh'))
    setTimeout(() => window.location.reload(), 150)
  }, [])

  // Start countdown only after an update is confirmed
  useEffect(() => {
    if (!updateAvailable) return

    setCountdown(COUNTDOWN_SECONDS)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          doRefresh()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [updateAvailable, doRefresh])

  useEffect(() => {
    const fetchVersion = async (): Promise<VersionPayload | null> => {
      try {
        // Cache-bust so CDN/browser never serves a stale version.json
        const res = await fetch(`/version.json?_cb=${Date.now()}`, {
          cache: 'no-store',
        })
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    }

    const checkVersion = async () => {
      const data = await fetchVersion()
      if (!data?.version) return

      if (baselineVersion.current === null) {
        // First load — establish baseline, report to parent
        baselineVersion.current = data.version
        onVersionLoaded?.(data.version)
        return
      }

      // Only act when the deployed version actually changed
      if (data.version !== baselineVersion.current) {
        setFromVersion(baselineVersion.current)
        setToVersion(data.version)
        setUpdateAvailable(true)
        onUpdateDetected?.(data.version)
      }
    }

    // Establish baseline immediately
    checkVersion()

    const intervalId = setInterval(checkVersion, POLL_INTERVAL)
    return () => clearInterval(intervalId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!updateAvailable) return null

  return (
    <div
      className={cn(
        'fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-arc-blue text-arc-navy rounded-xl shadow-lg px-5 py-3',
        'flex items-center gap-4 min-w-[300px] max-w-[90vw] animate-slide-up'
      )}
      role="alert"
      aria-live="assertive"
    >
      <RefreshCw size={18} className="flex-shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">
          {t.updateAvailable}
          {fromVersion && toVersion && fromVersion !== toVersion && (
            <span className="ml-1.5 font-mono opacity-80 text-xs">
              v{fromVersion} → v{toVersion}
            </span>
          )}
        </p>
        <p className="text-xs opacity-80">
          {t.updateCountdown} {countdown} {t.updateSeconds}
        </p>
      </div>
      {/* Intentionally no dismiss/close: the refresh must happen */}
      <button
        onClick={doRefresh}
        className="flex-shrink-0 bg-arc-navy text-arc-blue text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
      >
        {t.updateNow}
      </button>
    </div>
  )
}
