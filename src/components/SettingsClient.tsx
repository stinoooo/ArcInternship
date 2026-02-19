'use client'

import React, { useState } from 'react'
import { IUser } from '@/types'
import { translations } from '@/i18n/translations'
import { Trash2, Shield, User, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Props {
  users: IUser[]
  lang: string
  currentUserId: string
}

export function SettingsClient({ users: initialUsers, lang, currentUserId }: Props) {
  const [users, setUsers] = useState<IUser[]>(initialUsers)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [approving, setApproving] = useState<string | null>(null)

  const t = translations[lang as 'nl' | 'en'] || translations.nl

  const pending = users.filter(u => !u.approved)
  const active = users.filter(u => u.approved)

  const handleApprove = async (userId: string) => {
    setApproving(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, approved: true } : u))
        toast.success(lang === 'nl' ? 'Account goedgekeurd' : 'Account approved')
      } else {
        toast.error(t.error)
      }
    } catch {
      toast.error(t.error)
    } finally {
      setApproving(null)
    }
  }

  const handleDeny = async (userId: string) => {
    if (!confirm(lang === 'nl' ? 'Aanvraag weigeren en account verwijderen?' : 'Deny request and delete account?')) return
    setDeleting(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId))
        toast.success(lang === 'nl' ? 'Aanvraag geweigerd' : 'Request denied')
      } else {
        toast.error(t.error)
      }
    } catch {
      toast.error(t.error)
    } finally {
      setDeleting(null)
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
    } catch {
      toast.error(t.error)
    } finally {
      setDeleting(null)
    }
  }

  const handleRoleChange = async (userId: string, role: 'admin' | 'guest') => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u))
        toast.success(t.success)
      } else {
        toast.error(t.error)
      }
    } catch {
      toast.error(t.error)
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

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="card border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <User size={18} />
              {lang === 'nl' ? 'Wachtende aanvragen' : 'Pending Requests'}
            </h2>
            <span className="badge bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs">
              {pending.length}
            </span>
          </div>

          <div className="space-y-2">
            {pending.map(user => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-sm font-bold">
                  {user.username[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{user.username}</p>
                  <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(user._id)}
                    disabled={approving === user._id || deleting === user._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arc-success/10 text-arc-success hover:bg-arc-success/20 transition-colors text-sm font-medium disabled:opacity-50"
                    title={lang === 'nl' ? 'Goedkeuren' : 'Approve'}
                  >
                    {approving === user._id
                      ? <div className="w-3.5 h-3.5 border-2 border-arc-success border-t-transparent rounded-full animate-spin" />
                      : <Check size={14} />}
                    {lang === 'nl' ? 'Goedkeuren' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleDeny(user._id)}
                    disabled={approving === user._id || deleting === user._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arc-error/10 text-arc-error hover:bg-arc-error/20 transition-colors text-sm font-medium disabled:opacity-50"
                    title={lang === 'nl' ? 'Weigeren' : 'Deny'}
                  >
                    {deleting === user._id
                      ? <div className="w-3.5 h-3.5 border-2 border-arc-error border-t-transparent rounded-full animate-spin" />
                      : <X size={14} />}
                    {lang === 'nl' ? 'Weigeren' : 'Deny'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active users */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <User size={18} />
            {t.users}
          </h2>
          <span className="badge bg-[var(--border)] text-[var(--text-muted)] border border-[var(--border)] text-xs">
            {active.length}
          </span>
        </div>

        <div className="space-y-2">
          {active.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">
              {lang === 'nl' ? 'Geen actieve gebruikers' : 'No active users'}
            </p>
          )}
          {active.map(user => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]"
            >
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold',
                user.role === 'admin' ? 'bg-arc-blue/20 border border-arc-blue/30 text-arc-blue' : 'bg-[var(--border)] text-[var(--text-muted)]'
              )}>
                {user.username[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user.username}</p>
                <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {user._id !== currentUserId ? (
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user._id, e.target.value as 'admin' | 'guest')}
                    className="text-xs border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-arc-blue"
                  >
                    <option value="guest">{t.guest}</option>
                    <option value="admin">{t.admin}</option>
                  </select>
                ) : (
                  <span className={cn(
                    'badge flex items-center gap-1',
                    user.role === 'admin'
                      ? 'bg-arc-blue/10 text-arc-blue border border-arc-blue/20'
                      : 'bg-[var(--border)] text-[var(--text-muted)] border border-[var(--border)]'
                  )}>
                    {user.role === 'admin' && <Shield size={10} />}
                    {user.role === 'admin' ? t.admin : t.guest}
                  </span>
                )}
                {user._id !== currentUserId && (
                  <button
                    onClick={() => handleDelete(user._id)}
                    disabled={deleting === user._id}
                    className="p-1.5 text-[var(--text-muted)] hover:text-arc-error hover:bg-arc-error/10 rounded-lg transition-colors"
                    title={t.deleteUser}
                  >
                    {deleting === user._id
                      ? <div className="w-4 h-4 border-2 border-arc-error border-t-transparent rounded-full animate-spin" />
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
