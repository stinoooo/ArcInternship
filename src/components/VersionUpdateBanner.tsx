'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { translations } from '@/i18n/translations'
import { cn } from '@/lib/utils'

const POLL_INTERVAL = 2 * 60 * 1000 // Check every 2 minutes
const COUNTDOWN_SECONDS = 15

interface Props {
  lang: string
}

export function VersionUpdateBanner({ lang }: Props) {
  const t = translations[lang as 'nl' | 'en'] || translations.nl
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [fromVersion, setFromVersion] = useState<string | null>(null)
  const [toVersion, setToVersion] = useState<string | null>(null)
  const initialBuildId = useRef<number | null>(null)
  const initialVersion = useRef<string | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const doRefresh = useCallback(() => {
    // Dispatch event so components can save unsaved work to sessionStorage
    window.dispatchEvent(new CustomEvent('arc:beforeVersionRefresh'))
    // Small delay to allow event handlers to save state
    setTimeout(() => window.location.reload(), 150)
  }, [])

  // Start countdown when update is detected
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

  // Poll for version updates
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const buildId = data.buildId as number
        const version = data.version as string

        if (initialBuildId.current === null) {
          initialBuildId.current = buildId
          initialVersion.current = version
          return
        }

        if (buildId !== initialBuildId.current) {
          setFromVersion(initialVersion.current)
          setToVersion(version)
          setUpdateAvailable(true)
        }
      } catch {
        // Network error, ignore
      }
    }

    // Initial check (sets baseline)
    checkVersion()

    // Poll at interval
    const intervalId = setInterval(checkVersion, POLL_INTERVAL)
    return () => clearInterval(intervalId)
  }, [])

  if (!updateAvailable) return null

  return (
    <div className={cn(
      'fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50',
      'bg-arc-blue text-arc-navy rounded-xl shadow-lg px-5 py-3',
      'flex items-center gap-4 min-w-[300px] max-w-[90vw] animate-slide-up'
    )}>
      <RefreshCw size={18} className="flex-shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">
          {t.updateAvailable}
          {fromVersion && toVersion && fromVersion !== toVersion && (
            <span className="ml-1.5 font-mono opacity-80 text-xs">v{fromVersion} → v{toVersion}</span>
          )}
        </p>
        <p className="text-xs opacity-80">{t.updateCountdown} {countdown} {t.updateSeconds}</p>
      </div>
      <button
        onClick={doRefresh}
        className="flex-shrink-0 bg-arc-navy text-arc-blue text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
      >
        {t.updateNow}
      </button>
    </div>
  )
}
