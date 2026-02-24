'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { translations } from '@/i18n/translations'

type Lang = 'nl' | 'en'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get('ref') || ''
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [lang, setLang] = useState<Lang>('nl')

  useEffect(() => {
    const saved = localStorage.getItem('login_lang') as Lang | null
    if (saved === 'nl' || saved === 'en') setLang(saved)
  }, [])

  const t = translations[lang]

  const toggleLang = () => {
    const next: Lang = lang === 'nl' ? 'en' : 'nl'
    setLang(next)
    localStorage.setItem('login_lang', next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError(t.passwordsNoMatch)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, username: form.username, password: form.password, ...(inviteCode ? { inviteCode } : {}) }),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
      } else {
        setError(data.error || t.error)
      }
    } catch {
      setError(t.error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { label: t.featureProgress, value: t.featureTarget },
    { label: t.featurePeriod, value: t.featurePeriodValue },
    { label: t.featureDailyLog, value: t.featureQuick },
    { label: t.featureExportLabel, value: t.featureExcelValue },
  ]

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-arc-navy flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-arc-blue/20 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-arc-blue/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-arc-blue/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center">
          <Image src="/whitelogo.svg" alt={t.app} width={80} height={80} className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">{t.app}</h2>
          <p className="text-slate-400 text-lg mb-8">{t.loginSubtitle}</p>

          <div className="space-y-4 text-left">
            {features.map(item => (
              <div key={item.label} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-arc-blue" />
                <span className="text-slate-400 text-sm w-32">{item.label}</span>
                <span className="text-white text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-12 text-center">
          <p className="text-slate-600 text-xs">{t.footerText}</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-secondary)] relative">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="absolute top-4 right-4 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-arc-blue transition-colors"
        >
          {lang === 'nl' ? 'EN' : 'NL'}
        </button>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image src="/bluelogo.svg" alt={t.app} width={48} height={48} className="mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t.app}</h1>
          </div>

          <div className="card">
            {done ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <UserPlus size={24} className="text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t.registerSuccessTitle}</h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">{t.registerSuccessText}</p>
                <Link href="/login" className="btn-primary inline-flex items-center gap-2">
                  {t.backToLogin}
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{t.registerTitle}</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{t.registerSubtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">{t.email}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input"
                      placeholder="email@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">{t.usernameLabel}</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                      className="input"
                      placeholder={t.usernamePlaceholder}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">{t.password}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                        className="input pr-10"
                        placeholder={t.passwordMinHint}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">{t.confirmPasswordLabel}</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input"
                      placeholder={t.confirmPasswordPlaceholder}
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      'btn-primary w-full flex items-center justify-center gap-2 py-2.5',
                      loading && 'opacity-70 cursor-not-allowed'
                    )}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-arc-navy border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UserPlus size={16} />
                    )}
                    {loading ? t.loggingIn : t.registerButton}
                  </button>
                </form>

                <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                  {t.alreadyAccount}{' '}
                  <Link href="/login" className="text-arc-blue hover:underline font-medium">
                    {t.login}
                  </Link>
                </p>
              </>
            )}
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            {t.footerText}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
