'use client'

import React, { useState } from 'react'
import { IUser, UserRole } from '@/types'
import { translations } from '@/i18n/translations'
import { Trash2, Shield, User, Check, X, BookOpen, GraduationCap, Link2, Copy, AlertTriangle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

function ConfirmModal({ title, description, confirmLabel, onConfirm, onCancel }: {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-full bg-arc-error/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-arc-error" />
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{title}</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="btn-secondary text-sm px-4 py-2">
            Annuleren
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-arc-error text-white text-sm font-medium hover:bg-arc-error/90 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  users: IUser[]
  lang: string
  currentUserId: string
  currentUserRole: string
  currentUserInviteCode: string
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-arc-blue/20 border border-arc-blue/30 text-arc-blue',
  teacher: 'bg-purple-500/20 border border-purple-500/30 text-purple-400',
  student: 'bg-green-500/20 border border-green-500/30 text-green-400',
  guest: 'bg-gray-500/20 border border-gray-500/30 text-gray-400',
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield size={10} />,
  teacher: <BookOpen size={10} />,
  student: <GraduationCap size={10} />,
  guest: <User size={10} />,
}

export function SettingsClient({ users: initialUsers, lang, currentUserId, currentUserRole, currentUserInviteCode }: Props) {
  const [users, setUsers] = useState<IUser[]>(initialUsers)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [approving, setApproving] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ title: string; description: string; confirmLabel: string; onConfirm: () => void } | null>(null)
  const [resyncingDays, setResyncingDays] = useState(false)
  const [resyncResult, setResyncResult] = useState<string | null>(null)

  const t = translations[lang as 'nl' | 'en'] || translations.nl

  const isAdmin = currentUserRole === 'admin'

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
        const data = await res.json()
        toast.error(data.error || t.error)
      }
    } catch {
      toast.error(t.error)
    } finally {
      setApproving(null)
    }
  }

  const handleDeny = (userId: string) => {
    setConfirmModal({
      title: lang === 'nl' ? 'Aanvraag weigeren' : 'Deny request',
      description: t.confirmDeny,
      confirmLabel: lang === 'nl' ? 'Weigeren' : 'Deny',
      onConfirm: async () => {
        setConfirmModal(null)
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
      },
    })
  }

  const handleDelete = (userId: string) => {
    setConfirmModal({
      title: t.deleteUser,
      description: t.confirmDelete,
      confirmLabel: lang === 'nl' ? 'Verwijderen' : 'Delete',
      onConfirm: async () => {
        setConfirmModal(null)
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
      },
    })
  }

  const handleResyncDays = async () => {
    setResyncingDays(true)
    setResyncResult(null)
    try {
      const res = await fetch('/api/admin/resync-days', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setResyncResult(
          lang === 'nl'
            ? `Klaar — ${data.users} gebruikers, ${data.moved} verplaatst, ${data.inserted} aangemaakt, ${data.deleted} verwijderd`
            : `Done — ${data.users} users, ${data.moved} moved, ${data.inserted} created, ${data.deleted} deleted`
        )
      } else {
        toast.error(data.error || t.error)
      }
    } catch {
      toast.error(t.error)
    } finally {
      setResyncingDays(false)
    }
  }

  const handleRoleChange = async (userId: string, role: UserRole) => {
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
        const data = await res.json()
        toast.error(data.error || t.error)
      }
    } catch {
      toast.error(t.error)
    }
  }


  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return t.admin
      case 'teacher': return t.teacher
      case 'student': return t.student
      default: return t.guest
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
                <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user.username[0]?.toUpperCase()
                  )}
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
                  >
                    {approving === user._id
                      ? <div className="w-3.5 h-3.5 border-2 border-arc-success border-t-transparent rounded-full animate-spin" />
                      : <Check size={14} />}
                    {lang === 'nl' ? 'Goedkeuren' : 'Approve'}
                  </button>
                  {/* Only admins can deny/delete */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeny(user._id)}
                      disabled={approving === user._id || deleting === user._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arc-error/10 text-arc-error hover:bg-arc-error/20 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {deleting === user._id
                        ? <div className="w-3.5 h-3.5 border-2 border-arc-error border-t-transparent rounded-full animate-spin" />
                        : <X size={14} />}
                      {lang === 'nl' ? 'Weigeren' : 'Deny'}
                    </button>
                  )}
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
                'w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold',
                ROLE_COLORS[user.role] || ROLE_COLORS.guest
              )}>
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user.username[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user.username}</p>
                <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                {user.invitedByUsername && (
                  <p className="text-xs text-[var(--text-muted)] opacity-60 mt-0.5">
                    {lang === 'nl' ? 'via' : 'via'} {user.invitedByUsername}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Role management: admins only, not for self */}
                {isAdmin && user._id !== currentUserId ? (
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user._id, e.target.value as UserRole)}
                    className="text-xs border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-arc-blue"
                  >
                    <option value="guest">{t.guest}</option>
                    <option value="admin">{t.admin}</option>
                  </select>
                ) : (
                  <span className={cn(
                    'badge flex items-center gap-1',
                    ROLE_COLORS[user.role] || ROLE_COLORS.guest
                  )}>
                    {ROLE_ICONS[user.role]}
                    {getRoleLabel(user.role)}
                  </span>
                )}
                {/* Delete: admins only, not self */}
                {isAdmin && user._id !== currentUserId && (
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

      {/* Invite link — visible to admins and teachers */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={16} className="text-arc-blue" />
          <h2 className="font-semibold text-[var(--text-primary)]">
            {lang === 'nl' ? 'Uitnodigingslink' : 'Invite Link'}
          </h2>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          {lang === 'nl'
            ? 'Deel deze link zodat anderen een account kunnen aanvragen. Aanvragen worden handmatig goedgekeurd.'
            : 'Share this link so others can request an account. Requests are approved manually.'}
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-muted)] truncate select-all">
            {typeof window !== 'undefined'
              ? `${window.location.origin}/invite/${currentUserInviteCode}`
              : `/invite/${currentUserInviteCode}`}
          </code>
          <button
            onClick={() => {
              const url = `${window.location.origin}/invite/${currentUserInviteCode}`
              navigator.clipboard.writeText(url).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }).catch(() => {})
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0',
              copied
                ? 'bg-arc-success/15 text-arc-success border border-arc-success/30'
                : 'bg-arc-blue/10 text-arc-blue hover:bg-arc-blue/20 border border-arc-blue/20'
            )}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied
              ? (lang === 'nl' ? 'Gekopieerd!' : 'Copied!')
              : (lang === 'nl' ? 'Kopiëren' : 'Copy')}
          </button>
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          description={confirmModal.description}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* App info — admins only */}
      {isAdmin && (
        <div className="card">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4">
            {lang === 'nl' ? 'Applicatie-informatie' : 'Application Information'}
          </h2>
          <div className="space-y-2">
            {[
              { label: lang === 'nl' ? 'Applicatie' : 'Application', value: 'ArcInternship' },
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
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)] mb-2">
              {lang === 'nl' ? 'Dagrecords herstel' : 'Day records repair'}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleResyncDays}
                disabled={resyncingDays}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arc-blue/10 text-arc-blue hover:bg-arc-blue/20 border border-arc-blue/20 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {resyncingDays
                  ? <div className="w-3.5 h-3.5 border-2 border-arc-blue border-t-transparent rounded-full animate-spin" />
                  : <RefreshCw size={13} />}
                {lang === 'nl' ? 'Herstel dagrecords' : 'Repair day records'}
              </button>
              {resyncResult && (
                <span className="text-xs text-arc-success">{resyncResult}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
