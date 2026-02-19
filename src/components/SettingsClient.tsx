'use client'

import React, { useState } from 'react'
import { IUser } from '@/types'
import { translations } from '@/i18n/translations'
import { UserPlus, Trash2, Shield, User, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

type UserRole = 'admin' | 'guest'

interface FormState {
  email: string
  username: string
  role: UserRole
}

interface Props {
  users: IUser[]
  lang: string
  currentUserId: string
}

const defaultForm: FormState = { email: '', username: '', role: 'guest' }

export function SettingsClient({ users: initialUsers, lang, currentUserId }: Props) {
  const [users, setUsers] = useState<IUser[]>(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  const t = translations[lang as 'nl' | 'en'] || translations.nl

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const newUser = await res.json()
        setUsers(prev => [...prev, newUser])
        setForm(defaultForm)
        setShowForm(false)
        toast.success(t.userCreated)
      } else {
        const data = await res.json()
        toast.error(data.error || t.error)
      }
    } catch (_e) {
      toast.error(t.error)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm(t.confirmDelete)) return
    setDeleting(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId))
        toast.success(lang === 'nl' ? 'Gebruiker verwijderd' : 'User deleted')
      } else {
        toast.error(t.error)
      }
    } catch (_e) {
      toast.error(t.error)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t.settingsTitle}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {lang === 'nl' ? 'Beheer gebruikers en applicatie-instellingen' : 'Manage users and application settings'}
        </p>
      </div>

      {/* Users section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <User size={18} />
            {t.users}
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={16} />
            {t.addUser}
          </button>
        </div>

        {/* Create user form */}
        {showForm && (
          <form onSubmit={handleCreate} className="mb-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-3">
            <h3 className="font-medium text-[var(--text-primary)] text-sm">{t.createUser}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">{t.email}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="label">{t.username}</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                  className="input"
                  placeholder="username"
                  required
                />
              </div>
              <div>
                <label className="label">{t.role}</label>
                <select
                  value={form.role}
                  onChange={e => setForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  className="input"
                >
                  <option value="guest">{t.guest}</option>
                  <option value="admin">{t.admin}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">{t.cancel}</button>
              <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Mail size={14} />}
                {t.createUser}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {lang === 'nl'
                ? 'Een tijdelijk wachtwoord wordt automatisch gegenereerd en per e-mail verstuurd.'
                : 'A temporary password will be auto-generated and sent via email.'}
            </p>
          </form>
        )}

        {/* User list */}
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]"
            >
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold',
                user.role === 'admin' ? 'bg-arc-blue text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'
              )}>
                {user.username[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user.username}</p>
                <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'badge flex items-center gap-1',
                  user.role === 'admin'
                    ? 'bg-arc-blue/10 text-arc-blue border border-arc-blue/20'
                    : 'bg-[var(--border)] text-[var(--text-muted)] border border-[var(--border)]'
                )}>
                  {user.role === 'admin' && <Shield size={10} />}
                  {user.role === 'admin' ? t.admin : t.guest}
                </span>
                {user._id !== currentUserId && (
                  <button
                    onClick={() => handleDelete(user._id)}
                    disabled={deleting === user._id}
                    className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title={t.deleteUser}
                  >
                    {deleting === user._id
                      ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      : <Trash2 size={16} />
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="card">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">
          {lang === 'nl' ? 'Applicatie-informatie' : 'Application Information'}
        </h2>
        <div className="space-y-2">
          {[
            { label: 'Applicatie', value: 'ArcInternship' },
            { label: lang === 'nl' ? 'Stageperiode' : 'Internship Period', value: '09-02-2026 t/m 10-07-2026' },
            { label: lang === 'nl' ? 'Doelstelling' : 'Target', value: '760 uur' },
            { label: lang === 'nl' ? 'Standaard werktijd' : 'Default work hours', value: '09:00 – 17:00' },
            { label: 'Network', value: 'ArcNode Network & Stinoo Network' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm text-[var(--text-muted)]">{label}</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
