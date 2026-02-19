'use client'

import { IDay, DashboardStats } from '@/types'
import { translations } from '@/i18n/translations'
import { formatHours, getDayName, formatDate } from '@/lib/utils'
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

export function DashboardClient({ stats, days, lang }: Props) {
  const t = translations[lang as 'nl' | 'en'] || translations.nl

  const statCards = [
    {
      label: t.completedHours,
      value: `${stats.completedHours}u`,
      sub: `van ${stats.totalHours}u`,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: t.remainingHours,
      value: `${stats.remainingHours}u`,
      sub: `nog te lopen`,
      icon: Target,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: t.percentage,
      value: `${stats.percentage}%`,
      sub: `voltooid`,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: t.completedDays,
      value: stats.completedDays,
      sub: `van ${stats.totalWorkdays} dagen`,
      icon: CheckCircle,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: t.remainingDays,
      value: stats.remainingDays,
      sub: `open dagen`,
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Periode',
      value: '9 feb – 10 jul',
      sub: '2026',
      icon: Calendar,
      color: 'text-arc-blue',
      bg: 'bg-arc-blue/10',
    },
  ]

  // Recent weeks (last 4)
  const recentWeeks = stats.weeks.slice(-4).reverse()

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t.dashboard}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.targetHours} · {t.internshipPeriod}: 09-02-2026 t/m 10-07-2026</p>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Voortgang</h2>
            <p className="text-xs text-[var(--text-muted)]">{stats.completedHours} van {stats.totalHours} uur gelopen</p>
          </div>
          <span className="text-2xl font-bold text-arc-blue">{stats.percentage}%</span>
        </div>
        <div className="h-4 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div className={cn('p-2.5 rounded-lg', bg)}>
                <Icon size={20} className={color} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
              <p className="text-xs text-[var(--text-muted)]">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Week overview */}
      <div className="card">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t.weekOverview}</h2>
        <div className="space-y-3">
          {recentWeeks.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">Geen weken beschikbaar</p>
          ) : (
            recentWeeks.map(week => (
              <div key={week.weekNumber} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--bg-secondary)]">
                <div className="text-center min-w-[56px]">
                  <p className="text-xs text-[var(--text-muted)]">Week</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{week.weekNumber}</p>
                </div>
                <div className="flex-1">
                  <div className="flex gap-1 flex-wrap">
                    {week.days.map(day => (
                      <div
                        key={day.date}
                        title={`${getDayName(day.dayOfWeek, lang, true)} ${formatDate(day.date, lang)} – ${day.hours}u`}
                        className={cn(
                          'w-7 h-7 rounded flex items-center justify-center text-xs font-medium text-white',
                          day.isComplete
                            ? DAY_TYPE_COLORS[day.type] || 'bg-gray-400'
                            : 'bg-[var(--border)] text-[var(--text-muted)]'
                        )}
                      >
                        {getDayName(day.dayOfWeek, lang, true)[0]}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{week.totalHours}u</p>
                  <p className="text-xs text-[var(--text-muted)]">{week.completedDays}/{week.days.length} dagen</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
