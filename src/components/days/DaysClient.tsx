'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IDay, DayType } from '@/types'
import { translations } from '@/i18n/translations'
import { getDayName, formatDate, calculateHours, cn } from '@/lib/utils'
import { Search, Filter, CheckCircle2, Circle, ChevronDown, ChevronUp, Save, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  initialDays: IDay[]
  lang: string
  isAdmin: boolean
}

const DAY_TYPE_COLORS: Record<DayType, string> = {
  werkdag: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  thuiswerk: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  vrij: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  ziek: 'bg-red-500/10 text-red-500 border-red-500/20',
  feestdag: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
}

// Internship starts ISO week 7 of 2026
const INTERNSHIP_START_ISO_WEEK = 7

function getInternshipWeek(isoWeek: number): number {
  return isoWeek - INTERNSHIP_START_ISO_WEEK + 1
}

function stageWeekLabel(isoWeek: number, lang: string): string {
  const n = getInternshipWeek(isoWeek)
  if (lang === 'en') return `Internship week ${n}`
  const suffix = n === 1 ? 'ste' : 'de'
  return `${n}${suffix} stageweek`
}

function DayRow({ day, lang, isAdmin, onUpdate }: {
  day: IDay
  lang: string
  isAdmin: boolean
  onUpdate: (id: string, data: Partial<IDay>) => void
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const STORAGE_KEY = `arc:day:${day._id}`

  // Restore unsaved state from sessionStorage on mount
  const getInitialDay = () => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) return { ...day, ...JSON.parse(saved) }
    } catch { /* ignore */ }
    return day
  }

  const [localDay, setLocalDay] = useState<IDay>(getInitialDay)
  const t = translations[lang as 'nl' | 'en'] || translations.nl

  const hasChanges =
    localDay.type !== day.type ||
    localDay.startTime !== day.startTime ||
    localDay.endTime !== day.endTime ||
    localDay.activities !== day.activities ||
    localDay.isComplete !== day.isComplete

  const noHoursTypes: DayType[] = ['vrij', 'ziek', 'feestdag']
  const isNoHours = noHoursTypes.includes(localDay.type)

  // Save unsaved state to sessionStorage before version refresh
  useEffect(() => {
    if (!hasChanges) return

    const handleBeforeRefresh = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          type: localDay.type,
          startTime: localDay.startTime,
          endTime: localDay.endTime,
          activities: localDay.activities,
          isComplete: localDay.isComplete,
        }))
      } catch { /* ignore */ }
    }

    window.addEventListener('arc:beforeVersionRefresh', handleBeforeRefresh)
    return () => window.removeEventListener('arc:beforeVersionRefresh', handleBeforeRefresh)
  }, [hasChanges, localDay, STORAGE_KEY])

  // Clear sessionStorage after successful save
  const clearSavedState = () => {
    try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  const hadRestoredState = (() => {
    try { return !!sessionStorage.getItem(STORAGE_KEY) } catch { return false }
  })()

  const handleChange = (field: keyof IDay, value: string | number | boolean | DayType) => {
    const updated = { ...localDay, [field]: value }

    // Auto-calculate hours
    if (field === 'startTime' || field === 'endTime') {
      const start = field === 'startTime' ? value as string : localDay.startTime
      const end = field === 'endTime' ? value as string : localDay.endTime
      updated.hours = calculateHours(start, end)
    }

    // Zero hours for non-work types
    if (field === 'type' && noHoursTypes.includes(value as DayType)) {
      updated.hours = 0
    } else if (field === 'type') {
      updated.hours = calculateHours(localDay.startTime, localDay.endTime)
    }

    setLocalDay(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/days/${localDay._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: localDay.type,
          startTime: localDay.startTime,
          endTime: localDay.endTime,
          hours: localDay.hours,
          activities: localDay.activities,
          isComplete: localDay.isComplete,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        onUpdate(localDay._id, updated)
        setLocalDay(updated)
        clearSavedState()
        toast.success(t.success)
        router.refresh()
      } else {
        toast.error(t.error)
      }
    } catch (_e) {
      toast.error(t.error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleComplete = async () => {
    const newComplete = !localDay.isComplete
    setLocalDay(prev => ({ ...prev, isComplete: newComplete }))
    try {
      const res = await fetch(`/api/days/${localDay._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isComplete: newComplete }),
      })
      if (res.ok) {
        onUpdate(localDay._id, { isComplete: newComplete })
        router.refresh()
      }
    } catch (_err) {
      setLocalDay(prev => ({ ...prev, isComplete: !newComplete }))
    }
  }

  // Detect if state was restored from sessionStorage
  const wasRestored = hasChanges && (() => {
    try { return !!sessionStorage.getItem(STORAGE_KEY) } catch { return false }
  })()

  return (
    <div className={cn(
      'border border-[var(--border)] rounded-xl overflow-hidden transition-all',
      localDay.isComplete && 'border-green-500/30 bg-green-500/5'
    )}>
      {/* Row header */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
        {/* Complete toggle */}
        {isAdmin ? (
          <button onClick={handleToggleComplete} className="flex-shrink-0">
            {localDay.isComplete
              ? <CheckCircle2 size={20} className="text-green-500" />
              : <Circle size={20} className="text-[var(--text-muted)]" />
            }
          </button>
        ) : (
          <div className="flex-shrink-0">
            {localDay.isComplete
              ? <CheckCircle2 size={20} className="text-green-500" />
              : <Circle size={20} className="text-[var(--text-muted)]" />
            }
          </div>
        )}

        {/* Date info */}
        <div className="flex-shrink-0 text-center min-w-[42px]">
          <p className="text-xs text-[var(--text-muted)] font-medium">
            {getDayName(localDay.dayOfWeek, lang, true)}
          </p>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {new Date(localDay.date + 'T00:00:00').getDate()}
          </p>
        </div>

        {/* Full date */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] hidden sm:block">
            {formatDate(localDay.date, lang)}
          </p>
          <p className="text-xs font-medium text-[var(--text-primary)] sm:hidden">
            {new Date(localDay.date + 'T00:00:00').toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-US', { day: '2-digit', month: '2-digit' })}
          </p>
          {/* Restored state indicator */}
          {wasRestored && (
            <p className="text-[10px] text-amber-500 flex items-center gap-0.5 mt-0.5">
              <RotateCcw size={9} />
              {lang === 'nl' ? 'Hersteld' : 'Restored'}
            </p>
          )}
        </div>

        {/* Type badge */}
        <span className={cn('badge border text-xs hidden xs:inline-flex', DAY_TYPE_COLORS[localDay.type])}>
          {t[localDay.type as keyof typeof t] as string}
        </span>

        {/* Hours */}
        <div className="text-right min-w-[40px]">
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {isNoHours ? '–' : `${localDay.hours}u`}
          </p>
        </div>

        {/* Expand button — visible to everyone */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Activities preview (collapsed) */}
      {!expanded && localDay.activities && (
        <div className="px-3 sm:px-4 pb-3 pl-12">
          <p className="text-xs text-[var(--text-muted)] truncate">{localDay.activities}</p>
        </div>
      )}

      {/* Read-only expanded view for guests */}
      {expanded && !isAdmin && (
        <div className="px-3 sm:px-4 pb-4 pt-3 border-t border-[var(--border)] bg-[var(--bg-secondary)] space-y-3">
          {!(['vrij', 'ziek', 'feestdag'] as DayType[]).includes(localDay.type) && (
            <div className="flex gap-4 text-xs text-[var(--text-muted)]">
              <span>{localDay.startTime} – {localDay.endTime}</span>
              <span className="font-semibold text-[var(--text-primary)]">{localDay.hours}u</span>
            </div>
          )}
          {!localDay.activities ? (
            <p className="text-sm text-[var(--text-muted)] italic">
              {lang === 'nl' ? 'Geen activiteiten beschreven.' : 'No activities described.'}
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed break-words">
                {localDay.activities}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expanded edit form — admins only */}
      {expanded && isAdmin && (
        <div className="px-3 sm:px-4 pb-4 pt-2 border-t border-[var(--border)] bg-[var(--bg-secondary)] space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {/* Type */}
            <div>
              <label className="label">{t.type}</label>
              <select
                value={localDay.type}
                onChange={e => handleChange('type', e.target.value as DayType)}
                className="input text-sm"
              >
                {(['werkdag', 'thuiswerk', 'vrij', 'ziek', 'feestdag'] as DayType[]).map(type => (
                  <option key={type} value={type}>{t[type as keyof typeof t] as string}</option>
                ))}
              </select>
            </div>

            {/* Start time */}
            <div>
              <label className="label">{t.startTime}</label>
              <input
                type="time"
                value={localDay.startTime}
                onChange={e => handleChange('startTime', e.target.value)}
                disabled={isNoHours}
                className="input text-sm disabled:opacity-50"
              />
            </div>

            {/* End time */}
            <div>
              <label className="label">{t.endTime}</label>
              <input
                type="time"
                value={localDay.endTime}
                onChange={e => handleChange('endTime', e.target.value)}
                disabled={isNoHours}
                className="input text-sm disabled:opacity-50"
              />
            </div>

            {/* Hours */}
            <div>
              <label className="label">{t.hours}</label>
              <input
                type="number"
                value={localDay.hours}
                readOnly
                className="input text-sm opacity-70 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Activities */}
          <div>
            <label className="label">{t.activities}</label>
            <textarea
              value={localDay.activities}
              onChange={e => handleChange('activities', e.target.value)}
              className="input min-h-[140px] resize-y text-sm leading-relaxed"
              placeholder={lang === 'nl' ? 'Beschrijf de activiteiten van vandaag...' : "Describe today's activities..."}
            />
          </div>

          {/* Save */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localDay.isComplete}
                onChange={e => handleChange('isComplete', e.target.checked)}
                className="w-4 h-4 accent-arc-blue"
              />
              <span className="text-sm text-[var(--text-primary)]">{t.complete}</span>
            </label>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={cn(
                'btn-primary flex items-center gap-2 transition-opacity',
                (!hasChanges || saving) && 'opacity-40 cursor-not-allowed'
              )}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-arc-navy border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function DaysClient({ initialDays, lang, isAdmin }: Props) {
  const [days, setDays] = useState<IDay[]>(initialDays)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [completedFilter, setCompletedFilter] = useState(false)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set(
    Array.from(new Set(initialDays.map(d => d.weekNumber))).slice(-3)
  ))
  const [hasRestoredWork, setHasRestoredWork] = useState(false)

  const t = translations[lang as 'nl' | 'en'] || translations.nl

  // Check if any unsaved work was restored from sessionStorage
  useEffect(() => {
    const hasRestored = initialDays.some(day => {
      try { return !!sessionStorage.getItem(`arc:day:${day._id}`) } catch { return false }
    })
    if (hasRestored) {
      setHasRestoredWork(true)
      toast(t.unsavedRestored, { icon: '↩️', duration: 5000 })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = (id: string, data: Partial<IDay>) => {
    setDays(prev => prev.map(d => d._id === id ? { ...d, ...data } : d))
  }

  const filtered = useMemo(() => {
    return days.filter(day => {
      if (typeFilter !== 'all' && day.type !== typeFilter) return false
      if (completedFilter && day.isComplete) return false
      if (search && !day.date.includes(search)) return false
      return true
    })
  }, [days, typeFilter, completedFilter, search])

  // Group by week
  const weekGroups = useMemo(() => {
    const map = new Map<number, IDay[]>()
    filtered.forEach(day => {
      if (!map.has(day.weekNumber)) map.set(day.weekNumber, [])
      map.get(day.weekNumber)!.push(day)
    })
    return Array.from(map.entries()).map(([week, weekDays]) => ({
      week,
      days: weekDays,
      totalHours: weekDays.filter(d => d.isComplete).reduce((sum, d) => sum + d.hours, 0),
    }))
  }, [filtered])

  const toggleWeek = (week: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(week)) next.delete(week)
      else next.add(week)
      return next
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{t.daysTitle}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {days.filter(d => d.isComplete).length} / {days.length} {lang === 'nl' ? 'dagen afgerond' : 'days completed'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col gap-2 sm:gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchDate}
            className="input pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-[var(--text-muted)] flex-shrink-0" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="input flex-1 text-sm"
          >
            <option value="all">{t.allTypes}</option>
            {(['werkdag', 'thuiswerk', 'vrij', 'ziek', 'feestdag'] as DayType[]).map(type => (
              <option key={type} value={type}>{t[type as keyof typeof t] as string}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={completedFilter}
              onChange={e => setCompletedFilter(e.target.checked)}
              className="w-4 h-4 accent-arc-blue"
            />
            <span className="text-sm text-[var(--text-secondary)]">{t.incompleteOnly}</span>
          </label>
        </div>
      </div>

      {/* Week groups */}
      {weekGroups.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-[var(--text-muted)]">{t.noResults}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {weekGroups.map(({ week, days: weekDays, totalHours }) => (
            <div key={week} className="card p-0 overflow-hidden">
              <button
                onClick={() => toggleWeek(week)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {expandedWeeks.has(week)
                    ? <ChevronUp size={16} className="text-[var(--text-muted)] flex-shrink-0" />
                    : <ChevronDown size={16} className="text-[var(--text-muted)] flex-shrink-0" />}
                  <div className="text-left min-w-0">
                    <span className="font-semibold text-[var(--text-primary)] text-sm block">
                      {stageWeekLabel(week, lang)}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {lang === 'nl' ? 'Week' : 'ISO week'} {week} · {weekDays.filter(d => d.isComplete).length}/{weekDays.length} {lang === 'nl' ? 'compleet' : 'complete'}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-sm font-bold text-arc-blue">{totalHours}u</span>
                </div>
              </button>

              {expandedWeeks.has(week) && (
                <div className="px-2 sm:px-4 pb-3 pt-1 space-y-2">
                  {weekDays.map(day => (
                    <DayRow
                      key={day._id}
                      day={day}
                      lang={lang}
                      isAdmin={isAdmin}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
