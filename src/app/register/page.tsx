'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Wachtwoorden komen niet overeen.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, username: form.username, password: form.password }),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
      } else {
        setError(data.error || 'Er is een fout opgetreden.')
      }
    } catch {
      setError('Er is een fout opgetreden.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-arc-navy flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-arc-blue/20 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-arc-blue/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-arc-blue/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center">
          <Image src="/whitelogo.svg" alt="ArcInternship" width={80} height={80} className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">ArcInternship</h2>
          <p className="text-slate-400 text-lg mb-8">Stage Uren Registratie</p>

          <div className="space-y-4 text-left">
            {[
              { label: 'Voortgang', value: '760 uur doelstelling' },
              { label: 'Periode', value: '9 feb – 10 jul 2026' },
              { label: 'Dagregistratie', value: 'Snel en eenvoudig' },
              { label: 'Export', value: 'Professioneel Excel-bestand' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-arc-blue" />
                <span className="text-slate-400 text-sm w-32">{item.label}</span>
                <span className="text-white text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-12 text-center">
          <p className="text-slate-600 text-xs">Part of the ArcNode Network & Stinoo Network</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-secondary)]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image src="/bluelogo.svg" alt="ArcInternship" width={48} height={48} className="mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">ArcInternship</h1>
          </div>

          <div className="card">
            {done ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <UserPlus size={24} className="text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Aanvraag ingediend</h2>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  Je account-aanvraag is ontvangen. Je krijgt toegang zodra een beheerder je account goedkeurt.
                </p>
                <Link href="/login" className="btn-primary inline-flex items-center gap-2">
                  Terug naar inloggen
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Account aanvragen</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Een beheerder keurt je aanvraag goed</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">E-mailadres</label>
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
                    <label className="label">Gebruikersnaam</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                      className="input"
                      placeholder="gebruikersnaam"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Wachtwoord</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                        className="input pr-10"
                        placeholder="Minimaal 8 tekens"
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
                    <label className="label">Wachtwoord bevestigen</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input"
                      placeholder="Herhaal wachtwoord"
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UserPlus size={16} />
                    )}
                    {loading ? 'Bezig...' : 'Aanvragen'}
                  </button>
                </form>

                <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                  Al een account?{' '}
                  <Link href="/login" className="text-arc-blue hover:underline font-medium">
                    Inloggen
                  </Link>
                </p>
              </>
            )}
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            Part of the ArcNode Network & Stinoo Network
          </p>
        </div>
      </div>
    </div>
  )
}
