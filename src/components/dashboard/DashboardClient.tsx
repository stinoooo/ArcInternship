'use client'

import { IDay, IUser, DashboardStats } from '@/types'
import { translations } from '@/i18n/translations'
import { getDayName, formatDate, getWeekNumber } from '@/lib/utils'
import { Clock, CheckCircle, TrendingUp, Calendar, AlertCircle, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StudentPicker } from '@/components/StudentPicker'

interface Props {
  stats: DashboardStats
  days: IDay[]
  lang: string
  students?: IUser[]
  selectedStudentId?: string
  selectedStudent?: IUser | null
  isTeacherOrAdmin?: boolean
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
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const week1Monday = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000)
  const monday = new Date(week1Monday.getTime() + (weekNumber - 1) * 7 * 86400000)
  const friday = new Date(monday.getTime() + 4 * 86400000)
  const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`
  return `${fmt(monday)}–${fmt(friday)}`
}

function formatDateDisplay(iso: string | undefined): string {
  if (!iso) return '–'
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`
}

export function DashboardClient({
  stats,
  days,
  lang,
  students = [],
  selectedStudentId = '',
  selectedStudent,
  isTeacherOrAdmin = false,
}: Props) {
  const t = translations[lang as 'nl' | 'en'] || translations.nl

  const today = new Date()
  const currentWeek = getWeekNumber(today)
  const currentYear = today.getFullYear()

  const allWeekNumbers = stats.weeks.map(w => w.weekNumber)
  const minWeek = allWeekNumbers.length > 0 ? Math.min(...allWeekNumbers) : currentWeek
  const maxWeek = allWeekNumbers.length > 0 ? Math.max(...allWeekNumbers) : currentWeek

  const displayCurrentWeek = Math.min(Math.max(currentWeek, minWeek), maxWeek)
  const windowStart = displayCurrentWeek - 3
  const windowEnd = displayCurrentWeek

  const displayWeeks = stats.weeks
    .filter(w => w.weekNumber >= windowStart && w.weekNumber <= windowEnd)
    .sort((a, b) => b.weekNumber - a.weekNumber)

  const weekRangeLabel = displayWeeks.length > 0
    ? `${lang === 'nl' ? 'Weken' : 'Weeks'} ${windowStart}–${windowEnd}`
    : ''

  // Period from student profile or fallback
  const periodStart = formatDateDisplay(selectedStudent?.startDate ?? '2026-02-09')
  const periodEnd = formatDateDisplay(selectedStudent?.endDate ?? '2026-07-10')

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
      value: periodStart,
      sub: `t/m ${periodEnd}`,
      icon: Calendar,
      color: 'text-arc-blue',
      bg: 'bg-arc-blue/10',
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page title + student picker */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{t.dashboard}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {t.targetHours} · {t.internshipPeriod}: {periodStart} t/m {periodEnd}
          </p>
          {isTeacherOrAdmin && selectedStudent && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {selectedStudent.internshipPlace
                ? `${selectedStudent.internshipPlace}${selectedStudent.schoolName ? ` · ${selectedStudent.schoolName}` : ''}`
                : selectedStudent.schoolName ?? ''}
            </p>
          )}
        </div>
        {isTeacherOrAdmin && (
          <StudentPicker
            students={students}
            selectedStudentId={selectedStudentId}
            lang={lang}
          />
        )}
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
