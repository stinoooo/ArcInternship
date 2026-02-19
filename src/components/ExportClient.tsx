'use client'

import { useState } from 'react'
import { translations } from '@/i18n/translations'
import { Download, FileSpreadsheet, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props { lang: string }

export function ExportClient({ lang }: Props) {
  const t = translations[lang as 'nl' | 'en'] || translations.nl
  const [loading, setLoading] = useState<string | null>(null)

  const handleExport = async (completedOnly: boolean) => {
    const key = completedOnly ? 'completed' : 'all'
    setLoading(key)
    try {
      const params = new URLSearchParams({ lang, completed: String(completedOnly) })
      const res = await fetch(`/api/export?${params}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ArcInternship_Stage_Uren${completedOnly ? '_Afgerond' : ''}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(t.exportSuccess)
    } catch (_e) {
      toast.error(t.error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t.exportTitle}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.exportDescription}</p>
      </div>

      <div className="grid gap-4">
        {/* Export all */}
        <div className="card hover:border-arc-blue/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-arc-blue/10">
              <FileSpreadsheet size={24} className="text-arc-blue" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text-primary)]">{t.exportAll}</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {lang === 'nl'
                  ? 'Exporteer alle geregistreerde dagen, inclusief onvolledige.'
                  : 'Export all registered days, including incomplete ones.'}
              </p>
              <button
                onClick={() => handleExport(false)}
                disabled={loading !== null}
                className="btn-primary mt-4 flex items-center gap-2"
              >
                {loading === 'all' ? (
                  <div className="w-4 h-4 border-2 border-arc-navy border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {t.exportButton}
              </button>
            </div>
          </div>
        </div>

        {/* Export completed only */}
        <div className="card hover:border-green-500/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text-primary)]">{t.exportCompleted}</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {lang === 'nl'
                  ? 'Exporteer alleen de als "Compleet" aangemerkte dagen.'
                  : 'Export only days marked as "Complete".'}
              </p>
              <button
                onClick={() => handleExport(true)}
                disabled={loading !== null}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm mt-4 flex items-center gap-2"
              >
                {loading === 'completed' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {t.exportButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="card bg-arc-blue/5 border-arc-blue/20">
        <div className="flex items-start gap-3">
          <Clock size={18} className="text-arc-blue mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {lang === 'nl' ? 'Exportinhoud' : 'Export contents'}
            </p>
            <ul className="text-xs text-[var(--text-muted)] mt-2 space-y-1">
              {(lang === 'nl' ? [
                'Datum, dag, weeknummer',
                'Type dag (werkdag, thuiswerk, vrij, etc.)',
                'Starttijd en eindtijd',
                'Aantal uren',
                'Activiteiten / dagverslag',
                'Status (compleet/niet compleet)',
                'Samenvatting (totaal, resterend, percentage)',
              ] : [
                'Date, day, week number',
                'Day type (work, remote, off, etc.)',
                'Start and end time',
                'Number of hours',
                'Activities / daily report',
                'Status (complete/incomplete)',
                'Summary (total, remaining, percentage)',
              ]).map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-arc-blue" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
