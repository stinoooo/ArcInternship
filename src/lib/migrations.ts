import Migration from './models/Migration'
import Day from './models/Day'
import User from './models/User'
import { generateWorkingDays } from './utils'

/** superseded — kept so the DB entry is never re-used */
async function fixDayDateOffset() {}

/** superseded — kept so the DB entry is never re-used */
async function resyncDayDates() {}

/**
 * Hard reset for a single user: delete ALL their Day records and
 * re-insert every weekday in their internship period with default values.
 *
 * Any previously entered hours / activities will be lost, but this
 * guarantees the date and dayOfWeek values are always correct.
 */
export async function resyncDaysForUser(userId: string, startDate: string, endDate: string) {
  const start = new Date(startDate + 'T12:00:00')
  const end   = new Date(endDate   + 'T12:00:00')
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return { deleted: 0, inserted: 0 }

  const correctDays = generateWorkingDays(start, end)

  // Wipe every existing record for this user, then insert fresh ones.
  // Using a hard reset avoids all edge-cases from previous partial migrations
  // (wrong dayOfWeek, duplicate keys, silent insert failures, etc.).
  const deleteResult = await Day.deleteMany({ userId })
  const deleted = deleteResult.deletedCount ?? 0

  const toInsert = correctDays.map(d => ({ ...d, userId }))
  let inserted = 0
  if (toInsert.length > 0) {
    const result = await Day.insertMany(toInsert, { ordered: false })
    inserted = result.length
  }

  return { deleted, inserted }
}

async function resyncDayDates_v3() {
  const users = await User.find({
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
      console.error(`[migration] resyncDayDates_v3: error for user ${user._id}:`, err)
    }
  }

  console.log(`[migration] resyncDayDates_v3: deleted=${totalDeleted} inserted=${totalInserted}`)
}

const MIGRATIONS: { name: string; run: () => Promise<void> }[] = [
  { name: 'fixDayDateOffset',  run: fixDayDateOffset  },
  { name: 'resyncDayDates',    run: resyncDayDates     },
  { name: 'resyncDayDates_v3', run: resyncDayDates_v3  },
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
