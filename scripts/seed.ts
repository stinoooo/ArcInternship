import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { getISOWeek } from 'date-fns'

const MONGODB_URI = 'mongodb://mongo:ZeXcOdllbnehIpOYhwBaOQecCvRitzXx@switchback.proxy.rlwy.net:49087'

const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  role: String,
  approved: { type: Boolean, default: false },
  language: { type: String, default: 'nl' },
  theme: { type: String, default: 'light' },
}, { timestamps: true })

const DaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  date: { type: String, required: true },
  dayOfWeek: Number,
  weekNumber: Number,
  year: Number,
  type: { type: String, default: 'werkdag' },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
  hours: { type: Number, default: 8 },
  activities: { type: String, default: '' },
  isComplete: { type: Boolean, default: false },
}, { timestamps: true })

DaySchema.index({ date: 1, userId: 1 }, { unique: true, sparse: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Day = mongoose.models.Day || mongoose.model('Day', DaySchema)

function getWeekNumber(date: Date): number {
  return getISOWeek(date)
}

function generateWorkingDays(startDate: Date, endDate: Date) {
  const days = []
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)

  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, '0')
      const day = String(current.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
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

// Week 1 activities (09 feb - 13 feb 2026)
const week1Activities: Record<string, string> = {
  '2026-02-09': 'Eerste dag stage. Kennismaking met het team en de omgeving. Introductie in de projecten en tools.',
  '2026-02-10': 'Opzetten van de ontwikkelomgeving. Installatie van benodigde software en toegang tot repositories.',
  '2026-02-11': 'Eerste taken toegewezen. Begonnen met het lezen van documentatie en codebase verkennen.',
  '2026-02-12': 'Werken aan eerste taak: kleine bugfix in het dashboard component. Code review gevolgd.',
  '2026-02-13': 'Bugfix afgerond en gemerged. Stand-up meetings bijgewoond. Nieuwe taak gekregen voor volgende week.',
}

// Week 2 activities (16 feb - 18 feb 2026, t/m woensdag)
const week2Activities: Record<string, string> = {
  '2026-02-16': 'Start nieuwe sprint. Planning meeting bijgewoond. Begonnen met ontwikkeling nieuwe feature.',
  '2026-02-17': 'Verder gewerkt aan de nieuwe feature. Technisch overleg gehad met senior developer.',
  '2026-02-18': 'Feature bijna klaar. Unit tests geschreven. Code review aangevraagd.',
}

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: 'arcinternship' })
  console.log('Connected to MongoDB')

  // Create admin user
  const hashedPassword = await bcrypt.hash('Stijn.2013', 12)
  await User.findOneAndUpdate(
    { email: 'stijn@stinoo.dev' },
    {
      email: 'stijn@stinoo.dev',
      username: 'stijn',
      password: hashedPassword,
      role: 'admin',
      approved: true,
      language: 'nl',
      theme: 'dark',
    },
    { upsert: true, new: true }
  )
  console.log('Admin user created/updated')

  // Get the admin user's ID to associate days with them
  const adminUser = await User.findOne({ email: 'stijn@stinoo.dev' })
  if (!adminUser) throw new Error('Admin user not found')
  const adminUserId = adminUser._id

  // Drop any legacy unique index on date alone (without userId) that blocks
  // multi-user day records and prevents the app from seeding correctly
  try {
    await mongoose.connection.collection('days').dropIndex('date_1')
    console.log('Dropped legacy date_1 unique index')
  } catch (_e) {
    // Index may not exist — that is fine
  }

  // Generate all working days (use T00:00:00 to ensure local time parsing)
  const startDate = new Date('2026-02-09T00:00:00')
  const endDate = new Date('2026-07-10T00:00:00')
  const allDays = generateWorkingDays(startDate, endDate)

  // Mark week 1 as complete with activities
  const week1Dates = ['2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13']
  // Mark week 2 t/m woensdag as complete
  const week2DatesComplete = ['2026-02-16', '2026-02-17', '2026-02-18']

  for (const day of allDays) {
    const isWeek1 = week1Dates.includes(day.date)
    const isWeek2Complete = week2DatesComplete.includes(day.date)
    const activities = week1Activities[day.date] || week2Activities[day.date] || ''
    const isComplete = isWeek1 || isWeek2Complete

    await Day.findOneAndUpdate(
      { date: day.date, userId: adminUserId },
      { ...day, userId: adminUserId, activities, isComplete },
      { upsert: true, new: true }
    )
  }

  console.log(`Seeded ${allDays.length} working days`)
  await mongoose.disconnect()
  console.log('Done!')
}

seed().catch(console.error)
