import Migration from './models/Migration'
import Day from './models/Day'
import User from './models/User'
import { generateWorkingDays } from './utils'

/** superseded — kept so the DB entry is never re-used */
async function fixDayDateOffset() {}

/**
 * Core resync for a single user.
 *
 * A record is considered CORRECT only when BOTH its date AND its dayOfWeek
 * match the expected values from generateWorkingDays. Everything else is
 * deleted and re-inserted with defaults.
 *
 * Records that are fully correct (right date + right dayOfWeek) are
 * preserved — including any user-entered hours/activities.
 */
export async function resyncDaysForUser(userId: string, startDate: string, endDate: string) {
  const start = new Date(startDate + 'T12:00:00')
  const end   = new Date(endDate   + 'T12:00:00')
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return { deleted: 0, inserted: 0 }

  const correctDays   = generateWorkingDays(start, end)
  const correctByDate = new Map(correctDays.map(d => [d.date, d]))

  const existing = await Day.find({ userId }).lean()

  // Only records where both date AND dayOfWeek are correct are kept
  const fullyCorrect = new Set(
    existing
      .filter(r => {
        const exp = correctByDate.get(r.date)
        return exp && exp.dayOfWeek === r.dayOfWeek
      })
      .map(r => r.date)
  )

  // Delete everything that is not fully correct
  const toDeleteIds = existing
    .filter(r => !fullyCorrect.has(r.date))
    .map(r => r._id)

  let deleted = 0
  if (toDeleteIds.length > 0) {
    await Day.deleteMany({ _id: { $in: toDeleteIds } })
    deleted = toDeleteIds.length
  }

  // Insert all correct dates that are still missing
  const toInsert = correctDays
    .filter(d => !fullyCorrect.has(d.date))
    .map(d => ({ ...d, userId }))

  let inserted = 0
  if (toInsert.length > 0) {
    try {
      await Day.insertMany(toInsert, { ordered: false })
      inserted = toInsert.length
    } catch {
      // Ignore duplicate-key errors from concurrent inserts
    }
  }

  return { deleted, inserted }
}

async function resyncDayDates() {
  const users = await User.find({
    onboardingCompleted: true,
    startDate: { $exists: true, $ne: '' },
    endDate:   { $exists: true, $ne: '' },
  }).lean()

  let totalDeleted = 0, totalInserted = 0

  for (const user of users) {
    if (!user.startDate || !user.endDate) continue
    try {
      const r = await resyncDaysForUser(String(user._id), user.startDate, user.endDate)
      totalDeleted  += r.deleted
      totalInserted += r.inserted
    } catch (err) {
      console.error(`[migration] resyncDayDates: error for user ${user._id}:`, err)
    }
  }

  console.log(`[migration] resyncDayDates: deleted=${totalDeleted} inserted=${totalInserted}`)
}

const MIGRATIONS: { name: string; run: () => Promise<void> }[] = [
  { name: 'fixDayDateOffset', run: fixDayDateOffset },
  { name: 'resyncDayDates',   run: resyncDayDates   },
]

export async function runMigrations() {
  try {
    const completed = new Set(
      (await Migration.find({}).lean()).map((m: { name: string }) => m.name)
    )
    for (const migration of MIGRATIONS) {
      if (completed.has(migration.name)) continue
      console.log(`[migration] running: ${migration.name}`)
      await migration.run()
      await Migration.create({ name: migration.name })
      console.log(`[migration] done: ${migration.name}`)
    }
  } catch (err) {
    console.error('[migration] error during migrations (non-fatal):', err)
  }
}
