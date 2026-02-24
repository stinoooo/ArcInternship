'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { IUser } from '@/types'
import { translations } from '@/i18n/translations'
import { User, Lock, Camera, Building2, GraduationCap, Mail, Clock, Calendar, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Props {
  user: IUser | null
  lang: string
}

export function ProfileClient({ user, lang }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const t = translations[lang as 'nl' | 'en'] || translations.nl
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sessionUser = session?.user as { id?: string; role?: string }
  const isGuest = sessionUser?.role === 'guest'

  // Email form
  const [emailForm, setEmailForm] = useState({ currentPassword: '', newEmail: '', confirmEmail: '' })
  const [emailSaving, setEmailSaving] = useState(false)

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)

  // Profile/onboarding form
  const [profileForm, setProfileForm] = useState({
    internshipPlace: user?.internshipPlace || '',
    schoolName: user?.schoolName || '',
    studentEmail: user?.studentEmail || '',
    requiredHours: String(user?.requiredHours || '760'),
    startDate: user?.startDate || '',
    endDate: user?.endDate || '',
    supervisorContact: user?.supervisorContact || '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [avatarUploading, setAvatarUploading] = useState(false)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !sessionUser?.id) return

    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setAvatarUrl(data.avatarUrl)
        toast.success(t.avatarUpdated)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || t.avatarError)
      }
    } catch {
      toast.error(t.avatarError)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionUser?.id) return

    setEmailSaving(true)
    try {
      const res = await fetch('/api/profile/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      })
      if (res.ok) {
        toast.success(t.emailChanged)
        setEmailForm({ currentPassword: '', newEmail: '', confirmEmail: '' })
        router.refresh()
      } else {
        const data = await res.json()
        const errKey = data.error?.includes('in use') ? t.emailAlreadyInUse : (data.error || t.emailChangeError)
        toast.error(errKey)
      }
    } catch {
      toast.error(t.emailChangeError)
    } finally {
      setEmailSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionUser?.id) return

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error(lang === 'nl' ? 'Wachtwoorden komen niet overeen' : 'Passwords do not match')
      return
    }

    setPwSaving(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pwForm),
      })
      if (res.ok) {
        toast.success(t.passwordChanged)
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await res.json()
        toast.error(data.error || t.passwordChangeError)
      }
    } catch {
      toast.error(t.passwordChangeError)
    } finally {
      setPwSaving(false)
    }
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionUser?.id) return

    const hours = Number(profileForm.requiredHours)
    if (hours <= 0) {
      toast.error(lang === 'nl' ? 'Uren moeten groter zijn dan 0' : 'Hours must be greater than 0')
      return
    }
    if (profileForm.startDate && profileForm.endDate && new Date(profileForm.endDate) <= new Date(profileForm.startDate)) {
      toast.error(lang === 'nl' ? 'Einddatum moet na startdatum liggen' : 'End date must be after start date')
      return
    }

    setProfileSaving(true)
    try {
      const res = await fetch(`/api/users/${sessionUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileForm,
          requiredHours: hours,
        }),
      })
      if (res.ok) {
        toast.success(t.success)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || t.error)
      }
    } catch {
      toast.error(t.error)
    } finally {
      setProfileSaving(false)
    }
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return t.admin
      case 'teacher': return t.teacher
      case 'student': return t.student
      default: return t.guest
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t.profileTitle}</h1>
      </div>

      {/* User info + Avatar */}
      <div className="card">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-arc-blue/20 border-2 border-arc-blue/30 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={user?.username || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-arc-blue text-2xl font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              title={t.uploadAvatar}
            >
              {avatarUploading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera size={18} className="text-white" />
              }
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)] text-lg">{user?.username}</p>
            <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
            <span className="badge mt-1 bg-arc-blue/10 text-arc-blue border border-arc-blue/20 text-xs capitalize">
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          {t.uploadAvatar} (JPG, PNG, WebP · max 2MB)
        </p>
      </div>

      {/* Change Email */}
      <div className="card">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Mail size={16} />
          {t.changeEmail}
        </h2>
        <form onSubmit={handleEmailChange} className="space-y-3">
          <div>
            <label className="label">{t.newEmail}</label>
            <input
              type="email"
              value={emailForm.newEmail}
              onChange={e => setEmailForm(p => ({ ...p, newEmail: e.target.value }))}
              className="input text-sm"
              placeholder={user?.email}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="label">{t.confirmNewEmail}</label>
            <input
              type="email"
              value={emailForm.confirmEmail}
              onChange={e => setEmailForm(p => ({ ...p, confirmEmail: e.target.value }))}
              className="input text-sm"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="label">{t.currentPassword}</label>
            <input
              type="password"
              value={emailForm.currentPassword}
              onChange={e => setEmailForm(p => ({ ...p, currentPassword: e.target.value }))}
              className="input text-sm"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={emailSaving}
            className={cn(
              'btn-secondary flex items-center gap-2',
              emailSaving && 'opacity-50 cursor-not-allowed'
            )}
          >
            {emailSaving
              ? <div className="w-4 h-4 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
              : <Mail size={14} />
            }
            {t.changeEmail}
          </button>
        </form>
      </div>

      {/* Internship details — hidden for guest accounts */}
      {!isGuest && <div className="card">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Building2 size={16} />
          {lang === 'nl' ? 'Stagegegevens' : 'Internship Details'}
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1">
                <Building2 size={10} />
                {t.internshipPlace}
              </label>
              <input
                type="text"
                value={profileForm.internshipPlace}
                onChange={e => setProfileForm(p => ({ ...p, internshipPlace: e.target.value }))}
                className="input text-sm"
                placeholder={lang === 'nl' ? 'Stagebedrijf' : 'Company'}
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <GraduationCap size={10} />
                {t.schoolName}
              </label>
              <input
                type="text"
                value={profileForm.schoolName}
                onChange={e => setProfileForm(p => ({ ...p, schoolName: e.target.value }))}
                className="input text-sm"
                placeholder={lang === 'nl' ? 'School' : 'School'}
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Mail size={10} />
                {t.studentEmail}
              </label>
              <input
                type="email"
                value={profileForm.studentEmail}
                onChange={e => setProfileForm(p => ({ ...p, studentEmail: e.target.value }))}
                className="input text-sm"
                placeholder="student@school.nl"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Clock size={10} />
                {t.requiredHours}
              </label>
              <input
                type="number"
                value={profileForm.requiredHours}
                onChange={e => setProfileForm(p => ({ ...p, requiredHours: e.target.value }))}
                className="input text-sm"
                min="1"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Calendar size={10} />
                {t.startDate}
              </label>
              <input
                type="date"
                value={profileForm.startDate}
                onChange={e => setProfileForm(p => ({ ...p, startDate: e.target.value }))}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Calendar size={10} />
                {t.endDate}
              </label>
              <input
                type="date"
                value={profileForm.endDate}
                onChange={e => setProfileForm(p => ({ ...p, endDate: e.target.value }))}
                className="input text-sm"
              />
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <User size={10} />
              {t.supervisorContact}
            </label>
            <input
              type="text"
              value={profileForm.supervisorContact}
              onChange={e => setProfileForm(p => ({ ...p, supervisorContact: e.target.value }))}
              className="input text-sm"
              placeholder={lang === 'nl' ? 'Naam of e-mail begeleider' : 'Supervisor name or email'}
            />
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="btn-primary flex items-center gap-2"
          >
            {profileSaving
              ? <div className="w-4 h-4 border-2 border-arc-navy border-t-transparent rounded-full animate-spin" />
              : <Save size={14} />
            }
            {t.save}
          </button>
        </form>
      </div>}

      {/* Change Password */}
      <div className="card">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Lock size={16} />
          {t.changePassword}
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="label">{t.currentPassword}</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
              className="input text-sm"
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label className="label">{t.newPassword}</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
              className="input text-sm"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {lang === 'nl'
                ? 'Minimaal 8 tekens, hoofdletter, kleine letter en cijfer'
                : 'Minimum 8 chars, uppercase, lowercase, and number'
              }
            </p>
          </div>
          <div>
            <label className="label">{t.confirmNewPassword}</label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
              className="input text-sm"
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className={cn(
              'btn-secondary flex items-center gap-2',
              pwSaving && 'opacity-50 cursor-not-allowed'
            )}
          >
            {pwSaving
              ? <div className="w-4 h-4 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
              : <Lock size={14} />
            }
            {t.changePassword}
          </button>
        </form>
      </div>
    </div>
  )
}
