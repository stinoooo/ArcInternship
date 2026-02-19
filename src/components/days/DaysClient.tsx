'use client'

import { useState, useMemo } from 'react'
import { IDay, DayType } from '@/types'
import { translations } from '@/i18n/translations'
import { getDayName, formatDate, calculateHours, cn } from '@/lib/utils'
import { Search, Filter, CheckCircle2, Circle, ChevronDown, ChevronUp, Save } from 'lucide-react'
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

function DayRow({ day, lang, isAdmin, onUpdate }: {
  day: IDay
  lang: string
  isAdmin: boolean
  onUpdate: (id: string, data: Partial<IDay>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localDay, setLocalDay] = useState(day)
  const t = translations[lang as 'nl' | 'en'] || translations.nl

  const noHoursTypes: DayType[] = ['vrij', 'ziek', 'feestdag']
  const isNoHours = noHoursTypes.includes(localDay.type)

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
        toast.success(t.success)
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
      await fetch(`/api/days/${localDay._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isComplete: newComplete }),
      })
      onUpdate(localDay._id, { isComplete: newComplete })
    } catch (_err) {
      setLocalDay(prev => ({ ...prev, isComplete: !newComplete }))
    }
  }

  return (
    <div className={cn(
      'border border-[var(--border)] rounded-xl overflow-hidden transition-all',
      localDay.isComplete && 'border-green-500/30 bg-green-500/5'
    )}>
      {/* Row header */}
      <div className="flex items-center gap-3 p-4">
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
        <div className="flex-shrink-0 text-center min-w-[50px]">
          <p className="text-xs text-[var(--text-muted)] font-medium">
            {getDayName(localDay.dayOfWeek, lang, true)}
          </p>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {new Date(localDay.date + 'T00:00:00').getDate()}
          </p>
        </div>

        {/* Full date & week */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {formatDate(localDay.date, lang)}
          </p>
          <p className="text-xs text-[var(--text-muted)]">Week {localDay.weekNumber}</p>
        </div>

        {/* Type badge */}
        <span className={cn('badge border', DAY_TYPE_COLORS[localDay.type])}>
          {t[localDay.type as keyof typeof t] as string}
        </span>

        {/* Hours */}
        <div className="text-right min-w-[48px]">
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {isNoHours ? '–' : `${localDay.hours}u`}
          </p>
        </div>

        {/* Expand button */}
        {isAdmin && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Activities preview */}
      {!expanded && localDay.activities && (
        <div className="px-4 pb-3 pl-14">
          <p className="text-xs text-[var(--text-muted)] truncate">{localDay.activities}</p>
        </div>
      )}

      {/* Expanded edit form */}
      {expanded && isAdmin && (
        <div className="px-4 pb-4 pt-2 border-t border-[var(--border)] bg-[var(--bg-secondary)] space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Type */}
            <div>
              <label className="label">{t.type}</label>
              <select
                value={localDay.type}
                onChange={e => handleChange('type', e.target.value as DayType)}
                className="input"
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
                className="input disabled:opacity-50"
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
                className="input disabled:opacity-50"
              />
            </div>

            {/* Hours */}
            <div>
              <label className="label">{t.hours}</label>
              <input
                type="number"
                value={localDay.hours}
                readOnly
                className="input opacity-70 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Activities */}
          <div>
            <label className="label">{t.activities}</label>
            <textarea
              value={localDay.activities}
              onChange={e => handleChange('activities', e.target.value)}
              className="input min-h-[100px] resize-y"
              placeholder="Beschrijf de activiteiten van vandaag..."
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
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
    // Expand current week and recent weeks
    Array.from(new Set(initialDays.map(d => d.weekNumber))).slice(-3)
  ))

  const t = translations[lang as 'nl' | 'en'] || translations.nl

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t.daysTitle}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {days.filter(d => d.isComplete).length} / {days.length} {lang === 'nl' ? 'dagen afgerond' : 'days completed'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchDate}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[var(--text-muted)]" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">{t.allTypes}</option>
            {(['werkdag', 'thuiswerk', 'vrij', 'ziek', 'feestdag'] as DayType[]).map(type => (
              <option key={type} value={type}>{t[type as keyof typeof t] as string}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
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
        <div className="card text-center py-12">
          <p className="text-[var(--text-muted)]">{t.noResults}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {weekGroups.map(({ week, days: weekDays, totalHours }) => (
            <div key={week} className="card p-0 overflow-hidden">
              <button
                onClick={() => toggleWeek(week)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedWeeks.has(week) ? <ChevronUp size={18} className="text-[var(--text-muted)]" /> : <ChevronDown size={18} className="text-[var(--text-muted)]" />}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {t.week} {week}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {weekDays.filter(d => d.isComplete).length}/{weekDays.length} {lang === 'nl' ? 'compleet' : 'complete'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-arc-blue">{totalHours}u</span>
                  <span className="text-xs text-[var(--text-muted)] ml-1">{t.weekTotal}</span>
                </div>
              </button>

              {expandedWeeks.has(week) && (
                <div className="px-4 pb-4 space-y-2">
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
