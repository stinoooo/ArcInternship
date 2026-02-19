import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getISOWeek } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWeekNumber(date: Date): number {
  return getISOWeek(date)
}

export function formatDate(dateStr: string, lang: string = 'nl'): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getDayName(dayOfWeek: number, lang: string = 'nl', short = false): string {
  const nlDays = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
  const nlShort = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
  const enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const enShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (lang === 'nl') return short ? nlShort[dayOfWeek] : nlDays[dayOfWeek]
  return short ? enShort[dayOfWeek] : enDays[dayOfWeek]
}

export function calculateHours(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM)
  return Math.max(0, totalMinutes / 60)
}

export function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}u`
  return `${h}u ${m}m`
}

// Generate all working days between two dates
export function generateWorkingDays(startDate: Date, endDate: Date) {
  const days = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)

  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    // Only Monday-Friday (1-5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dateStr = current.toISOString().split('T')[0]
      days.push({
        date: dateStr,
        dayOfWeek,
        weekNumber: getWeekNumber(current),
        year: current.getFullYear(),
        type: 'werkdag',
        startTime: '09:00',
        endTime: '17:00',
        hours: 8,
        activities: '',
        isComplete: false,
      })
    }
    current.setDate(current.getDate() + 1)
  }
  return days
}
