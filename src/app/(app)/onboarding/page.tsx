'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { translations } from '@/i18n/translations'
import { GraduationCap, Building2, Mail, Clock, Calendar, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const user = session?.user as { id?: string; role?: string; language?: string; onboardingCompleted?: boolean }

  // Language: read from localStorage (same key as login page) so the selection there carries over
  const [lang, setLang] = useState<'nl' | 'en'>('nl')
  useEffect(() => {
    const saved = localStorage.getItem('login_lang') as 'nl' | 'en' | null
    if (saved === 'nl' || saved === 'en') setLang(saved)
    else if (user?.language === 'en') setLang('en')
  }, [user?.language])

  const toggleLang = () => {
    const next: 'nl' | 'en' = lang === 'nl' ? 'en' : 'nl'
    setLang(next)
    localStorage.setItem('login_lang', next)
  }

  const t = translations[lang] || translations.nl

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    internshipPlace: '',
    schoolName: '',
    studentEmail: '',
    requiredHours: '760',
    startDate: '2026-02-09',
    endDate: '2026-07-10',
    supervisorContact: '',
  })

  // Admins and teachers skip onboarding
  useEffect(() => {
    if (session && (user?.role === 'admin' || user?.role === 'teacher')) {
      router.replace('/dashboard')
    }
    if (session && user?.onboardingCompleted) {
      router.replace('/dashboard')
    }
  }, [session, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    // Client-side validation
    if (!form.internshipPlace.trim()) {
      toast.error(lang === 'nl' ? 'Stagebedrijf is verplicht' : 'Internship place is required')
      return
    }
    if (!form.schoolName.trim()) {
      toast.error(lang === 'nl' ? 'School is verplicht' : 'School name is required')
      return
    }
    if (!form.studentEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.studentEmail)) {
      toast.error(lang === 'nl' ? 'Geldig e-mailadres vereist' : 'Valid email required')
      return
    }
    const hours = Number(form.requiredHours)
    if (!hours || hours <= 0) {
      toast.error(lang === 'nl' ? 'Uren moeten groter zijn dan 0' : 'Hours must be greater than 0')
      return
    }
    if (!form.startDate || !form.endDate) {
      toast.error(lang === 'nl' ? 'Start- en einddatum zijn verplicht' : 'Start and end date required')
      return
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error(lang === 'nl' ? 'Einddatum moet na startdatum liggen' : 'End date must be after start date')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          requiredHours: hours,
          onboardingCompleted: true,
        }),
      })
      if (res.ok) {
        toast.success(t.onboardingSuccess)
        // Force session refresh to update onboardingCompleted in token
        await update({ onboardingCompleted: true })
        router.replace('/dashboard')
      } else {
        const data = await res.json()
        toast.error(data.error || t.error)
      }
    } catch {
      toast.error(t.error)
    } finally {
      setSaving(false)
    }
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative">
      {/* Language toggle */}
      <button
        onClick={toggleLang}
        className="absolute top-4 right-4 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-arc-blue transition-colors"
      >
        {lang === 'nl' ? 'EN' : 'NL'}
      </button>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/bluelogo.svg" alt={t.app} width={48} height={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t.onboardingTitle}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">{t.onboardingSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {/* Internship Place */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Building2 size={12} />
              {t.internshipPlace} *
            </label>
            <input
              type="text"
              name="internshipPlace"
              value={form.internshipPlace}
              onChange={handleChange}
              className="input"
              placeholder={lang === 'nl' ? 'Naam van het stagebedrijf' : 'Company name'}
              required
            />
          </div>

          {/* School */}
          <div>
            <label className="label flex items-center gap-1.5">
              <GraduationCap size={12} />
              {t.schoolName} *
            </label>
            <input
              type="text"
              name="schoolName"
              value={form.schoolName}
              onChange={handleChange}
              className="input"
              placeholder={lang === 'nl' ? 'Naam van je school' : 'School name'}
              required
            />
          </div>

          {/* Student Email */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Mail size={12} />
              {t.studentEmail} *
            </label>
            <input
              type="email"
              name="studentEmail"
              value={form.studentEmail}
              onChange={handleChange}
              className="input"
              placeholder={lang === 'nl' ? 'je.naam@school.nl' : 'your.name@school.edu'}
              required
            />
          </div>

          {/* Required Hours */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Clock size={12} />
              {t.requiredHours} *
            </label>
            <input
              type="number"
              name="requiredHours"
              value={form.requiredHours}
              onChange={handleChange}
              className="input"
              min="1"
              max="10000"
              required
            />
          </div>

          {/* Start / End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1.5">
                <Calendar size={12} />
                {t.startDate} *
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Calendar size={12} />
                {t.endDate} *
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          {/* Supervisor Contact (optional) */}
          <div>
            <label className="label flex items-center gap-1.5">
              <User size={12} />
              {t.supervisorContact} ({lang === 'nl' ? 'optioneel' : 'optional'})
            </label>
            <input
              type="text"
              name="supervisorContact"
              value={form.supervisorContact}
              onChange={handleChange}
              className="input"
              placeholder={lang === 'nl' ? 'Naam of e-mail begeleider' : 'Supervisor name or email'}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-arc-navy border-t-transparent rounded-full animate-spin" />
              : <GraduationCap size={16} />
            }
            {saving ? t.loading : t.onboardingComplete}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-4">
          {lang === 'nl'
            ? 'Je kunt deze gegevens later wijzigen in je profiel'
            : 'You can change these details later in your profile'
          }
        </p>
      </div>
    </div>
  )
}
