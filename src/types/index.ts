export type DayType = 'werkdag' | 'thuiswerk' | 'vrij' | 'ziek' | 'feestdag'
export type UserRole = 'guest' | 'student' | 'teacher' | 'admin'
export type Language = 'nl' | 'en'

export interface IUser {
  _id: string
  email: string
  username: string
  password: string
  role: UserRole
  approved: boolean
  language: Language
  theme: 'light' | 'dark'
  avatarUrl?: string
  // Onboarding fields
  onboardingCompleted: boolean
  internshipPlace?: string
  schoolName?: string
  studentEmail?: string
  requiredHours?: number
  startDate?: string     // YYYY-MM-DD
  endDate?: string       // YYYY-MM-DD
  supervisorContact?: string
  createdAt: Date
  updatedAt: Date
}

export interface IDay {
  _id: string
  userId?: string
  date: string // ISO date string YYYY-MM-DD
  dayOfWeek: number // 0=Sun, 1=Mon... 6=Sat
  weekNumber: number
  year: number
  type: DayType
  startTime: string // HH:mm
  endTime: string // HH:mm
  hours: number
  activities: string
  isComplete: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WeekSummary {
  weekNumber: number
  year: number
  days: IDay[]
  totalHours: number
  completedDays: number
}

export interface DashboardStats {
  totalHours: number
  completedHours: number
  remainingHours: number
  percentage: number
  completedDays: number
  totalWorkdays: number
  remainingDays: number
  weeks: WeekSummary[]
}
