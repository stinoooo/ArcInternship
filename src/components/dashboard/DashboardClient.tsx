'use client'

import { IDay, DashboardStats } from '@/types'
import { translations } from '@/i18n/translations'
import { getDayName, formatDate, getWeekNumber } from '@/lib/utils'
import { Clock, CheckCircle, TrendingUp, Calendar, AlertCircle, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  stats: DashboardStats
  days: IDay[]
  lang: string
}

const DAY_TYPE_COLORS: Record<string, string> = {
  werkdag: 'bg-blue-500',
  thuiswerk: 'bg-purple-500',
  vrij: 'bg-gray-400',
  ziek: 'bg-red-500',
  feestdag: 'bg-orange-400',
}

const INTERNSHIP_START_ISO_WEEK = 7

function stageWeekLabel(isoWeek: number, lang: string): string {
  const n = isoWeek - INTERNSHIP_START_ISO_WEEK + 1
  if (n <= 0) return lang === 'nl' ? `Week ${isoWeek}` : `Week ${isoWeek}`
  if (lang === 'en') return `Intern. wk ${n}`
  const suffix = n === 1 ? 'ste' : 'de'
  return `${n}${suffix} wk`
}

function getWeekDateRange(weekNumber: number, year: number): string {
  // Get Monday and Friday of the given ISO week
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const week1Monday = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000)
  const monday = new Date(week1Monday.getTime() + (weekNumber - 1) * 7 * 86400000)
  const friday = new Date(monday.getTime() + 4 * 86400000)
  const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`
  return `${fmt(monday)}–${fmt(friday)}`
}

export function DashboardClient({ stats, days, lang }: Props) {
  const t = translations[lang as 'nl' | 'en'] || translations.nl

  // Get current ISO week
  const today = new Date()
  const currentWeek = getWeekNumber(today)
  const currentYear = today.getFullYear()

  // Select the 4-week window: current week + 3 previous weeks
  // If current week is before or after internship, clamp to available data
  const allWeekNumbers = stats.weeks.map(w => w.weekNumber)
  const minWeek = allWeekNumbers.length > 0 ? Math.min(...allWeekNumbers) : currentWeek
  const maxWeek = allWeekNumbers.length > 0 ? Math.max(...allWeekNumbers) : currentWeek

  // Show current week (or latest if current is outside range) + 3 previous
  const displayCurrentWeek = Math.min(Math.max(currentWeek, minWeek), maxWeek)
  const windowStart = displayCurrentWeek - 3
  const windowEnd = displayCurrentWeek

  const displayWeeks = stats.weeks
    .filter(w => w.weekNumber >= windowStart && w.weekNumber <= windowEnd)
    .sort((a, b) => b.weekNumber - a.weekNumber) // Newest first

  // Week range label
  const weekRangeLabel = displayWeeks.length > 0
    ? `${lang === 'nl' ? 'Weken' : 'Weeks'} ${windowStart}–${windowEnd}`
    : ''

  const statCards = [
    {
      label: t.completedHours,
      value: `${stats.completedHours}u`,
      sub: `${lang === 'nl' ? 'van' : 'of'} ${stats.totalHours}u`,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: t.remainingHours,
      value: `${stats.remainingHours}u`,
      sub: lang === 'nl' ? 'nog te lopen' : 'remaining',
      icon: Target,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: t.percentage,
      value: `${stats.percentage}%`,
      sub: lang === 'nl' ? 'voltooid' : 'completed',
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: t.completedDays,
      value: stats.completedDays,
      sub: `${lang === 'nl' ? 'van' : 'of'} ${stats.totalWorkdays} ${lang === 'nl' ? 'dagen' : 'days'}`,
      icon: CheckCircle,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: t.remainingDays,
      value: stats.remainingDays,
      sub: lang === 'nl' ? 'open dagen' : 'open days',
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      label: lang === 'nl' ? 'Periode' : 'Period',
      value: '9 feb – 10 jul',
      sub: '2026',
      icon: Calendar,
      color: 'text-arc-blue',
      bg: 'bg-arc-blue/10',
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{t.dashboard}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.targetHours} · {t.internshipPeriod}: 09-02-2026 t/m 10-07-2026</p>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">{lang === 'nl' ? 'Voortgang' : 'Progress'}</h2>
            <p className="text-xs text-[var(--text-muted)]">{stats.completedHours} {lang === 'nl' ? 'van' : 'of'} {stats.totalHours} {lang === 'nl' ? 'uur gelopen' : 'hours logged'}</p>
          </div>
          <span className="text-2xl font-bold text-arc-blue">{stats.percentage}%</span>
        </div>
        <div className="h-3 sm:h-4 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-arc-blue to-arc-blue-light rounded-full transition-all duration-1000"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
          <span>0u</span>
          <span>{Math.round(stats.totalHours / 2)}u</span>
          <span>{stats.totalHours}u</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="card p-3 sm:p-4">
            <div className={cn('p-2 sm:p-2.5 rounded-lg w-fit', bg)}>
              <Icon size={18} className={color} />
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
              <p className="text-xs text-[var(--text-muted)]">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Week overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">{t.weekOverview}</h2>
          {weekRangeLabel && (
            <span className="text-xs text-arc-blue font-medium bg-arc-blue/10 px-2.5 py-1 rounded-full">
              {weekRangeLabel}
            </span>
          )}
        </div>
        <div className="space-y-2">
          {displayWeeks.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">{lang === 'nl' ? 'Geen weken beschikbaar' : 'No weeks available'}</p>
          ) : (
            displayWeeks.map(week => {
              const isCurrentWeek = week.weekNumber === currentWeek
              const dateRange = getWeekDateRange(week.weekNumber, week.year || currentYear)
              return (
                <div
                  key={week.weekNumber}
                  className={cn(
                    'flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 rounded-lg transition-colors',
                    isCurrentWeek
                      ? 'bg-arc-blue/5 border border-arc-blue/20'
                      : 'bg-[var(--bg-secondary)]'
                  )}
                >
                  <div className="text-center w-[72px] sm:w-[84px] flex-shrink-0">
                    <div className="flex items-center gap-1 justify-center">
                      <p className="text-[10px] text-[var(--text-muted)] leading-tight font-medium">
                        {stageWeekLabel(week.weekNumber, lang)}
                      </p>
                      {isCurrentWeek && (
                        <span className="text-[9px] bg-arc-blue text-arc-navy font-bold px-1 rounded leading-tight">
                          {lang === 'nl' ? 'NU' : 'NOW'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] opacity-60 mt-0.5">{dateRange}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-1 flex-wrap">
                      {week.days.map(day => (
                        <div
                          key={day.date}
                          title={`${getDayName(day.dayOfWeek, lang, true)} ${formatDate(day.date, lang)} – ${day.hours}u`}
                          className={cn(
                            'w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-xs font-medium',
                            day.isComplete
                              ? cn(DAY_TYPE_COLORS[day.type] || 'bg-gray-400', 'text-white')
                              : 'bg-[var(--border)] text-[var(--text-muted)]'
                          )}
                        >
                          {getDayName(day.dayOfWeek, lang, true)[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{week.totalHours}u</p>
                    <p className="text-xs text-[var(--text-muted)]">{week.completedDays}/{week.days.length} {lang === 'nl' ? 'dagen' : 'days'}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
