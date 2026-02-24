'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CalendarDays,
  FileDown,
  BarChart3,
  Globe,
  ChevronRight,
  UserPlus,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Lang = 'nl' | 'en'

const content = {
  nl: {
    tagline: 'Jouw stage, netjes bijgehouden.',
    subtitle:
      'ArcInternship is een privéapplicatie voor het registreren en exporteren van stageuren. ' +
      'Houd dagelijks je werktijd bij, exporteer naar Excel en volg je voortgang richting de eindstreep.',
    features: [
      { icon: CalendarDays, title: 'Dagregistratie', desc: 'Log elke werkdag met starttijd, eindtijd en activiteiten.' },
      { icon: BarChart3, title: 'Voortgangsdashboard', desc: 'Zie in één oogopslag hoeveel uren je al hebt gelopen en wat er nog rest.' },
      { icon: FileDown, title: 'Excel-export', desc: 'Download een professioneel overzicht van je stagelogboek.' },
      { icon: Clock, title: 'Dag- en weekoverzicht', desc: 'Filter op type dag, week of datum en houd alles overzichtelijk.' },
    ],
    cta: 'Account aanvragen',
    ctaSub: 'Aanvragen gaat snel — een beheerder keurt je account daarna goed.',
    login: 'Heb je al een account?',
    loginLink: 'Inloggen',
    access: 'Toegang op uitnodiging',
    accessSub: 'ArcInternship is een besloten platform. Je kunt een account aanvragen; een beheerder keurt dit handmatig goed.',
  },
  en: {
    tagline: 'Your internship, neatly tracked.',
    subtitle:
      'ArcInternship is a private application for logging and exporting internship hours. ' +
      'Track your daily working hours, export to Excel, and monitor your progress toward the finish line.',
    features: [
      { icon: CalendarDays, title: 'Daily Log', desc: 'Record every workday with start time, end time, and activities.' },
      { icon: BarChart3, title: 'Progress Dashboard', desc: 'See at a glance how many hours you have logged and how many remain.' },
      { icon: FileDown, title: 'Excel Export', desc: 'Download a professional overview of your internship log.' },
      { icon: Clock, title: 'Day & Week Overview', desc: 'Filter by day type, week, or date and keep everything organised.' },
    ],
    cta: 'Request an Account',
    ctaSub: 'Requesting is quick — an admin will approve your account afterwards.',
    login: 'Already have an account?',
    loginLink: 'Log in',
    access: 'Access by invitation',
    accessSub: 'ArcInternship is a closed platform. You can request an account; an admin will approve it manually.',
  },
}

export default function InvitePage() {
  const [lang, setLang] = useState<Lang>('nl')

  useEffect(() => {
    const saved = localStorage.getItem('login_lang') as Lang | null
    if (saved === 'nl' || saved === 'en') setLang(saved)
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'nl' ? 'en' : 'nl'
    setLang(next)
    localStorage.setItem('login_lang', next)
  }

  const c = content[lang]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <Image src="/bluelogo.svg" alt="ArcInternship" width={28} height={28} />
          <span className="font-bold text-[var(--text-primary)]">ArcInternship</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Globe size={13} />
            {lang === 'nl' ? 'EN' : 'NL'}
          </button>
          <Link
            href="/login"
            className="text-sm text-[var(--text-muted)] hover:text-arc-blue transition-colors"
          >
            {c.loginLink}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-xl w-full">
          <div className="mb-6 flex justify-center">
            <Image src="/bluelogo.svg" alt="ArcInternship" width={64} height={64} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            {c.tagline}
          </h1>

          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed mb-10">
            {c.subtitle}
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 text-left">
            {c.features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-arc-blue/10 text-arc-blue flex-shrink-0">
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Access notice */}
          <div className="mb-6 px-4 py-3 rounded-xl bg-arc-blue/5 border border-arc-blue/20 text-left">
            <p className="text-xs font-semibold text-arc-blue mb-1">{c.access}</p>
            <p className="text-xs text-[var(--text-muted)]">{c.accessSub}</p>
          </div>

          {/* CTA */}
          <Link
            href="/register"
            className={cn(
              'inline-flex items-center justify-center gap-2 w-full',
              'btn-primary text-base py-3 rounded-xl font-semibold'
            )}
          >
            <UserPlus size={18} />
            {c.cta}
            <ChevronRight size={16} className="opacity-70" />
          </Link>

          <p className="text-xs text-[var(--text-muted)] mt-3">{c.ctaSub}</p>

          <p className="text-sm text-[var(--text-muted)] mt-6">
            {c.login}{' '}
            <Link href="/login" className="text-arc-blue hover:underline font-medium">
              {c.loginLink}
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center px-4 py-5 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} ArcInternship · Part of the ArcNode Network &amp; Stinoo Network
        </p>
      </footer>
    </div>
  )
}
