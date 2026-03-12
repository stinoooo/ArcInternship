import Migration from './models/Migration'
import Day from './models/Day'
import User from './models/User'
import { generateWorkingDays } from './utils'

/**
 * Original attempt — superseded by resyncDayDates.
 * Kept so the migrations-table entry is never re-used.
 */
async function fixDayDateOffset() {
  // superseded by resyncDayDates
}

/**
 * Core resync logic — exported so admin endpoints can call it directly.
 *
 * For a single user:
 * 1. Generate the correct set of working-day dates.
 * 2. Records on a WRONG date but with the right dayOfWeek → move to correct date
 *    (preserves hours/activities the user already filled in).
 * 3. Records that can't be matched → delete.
 * 4. Correct dates with no record → insert with defaults.
 */
export async function resyncDaysForUser(userId: string, startDate: string, endDate: string) {
  const start = new Date(startDate + 'T12:00:00')
  const end   = new Date(endDate   + 'T12:00:00')
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return { moved: 0, deleted: 0, inserted: 0 }

  const correctDays   = generateWorkingDays(start, end)
  const correctByDate = new Map(correctDays.map(d => [d.date, d]))
  const existing      = await Day.find({ userId }).lean()

  const wrongRecords  = existing.filter(r => !correctByDate.has(r.date))
  const coveredDates  = new Set(existing.filter(r => correctByDate.has(r.date)).map(r => r.date))
  const missingDates  = correctDays.filter(d => !coveredDates.has(d.date))

  // Group missing dates by dayOfWeek for matching
  const missingByDow = new Map<number, typeof missingDates>()
  for (const md of missingDates) {
    if (!missingByDow.has(md.dayOfWeek)) missingByDow.set(md.dayOfWeek, [])
    missingByDow.get(md.dayOfWeek)!.push(md)
  }
  missingByDow.forEach(arr => arr.sort((a, b) => a.date.localeCompare(b.date)))

  const stillMissing = new Map(missingDates.map(d => [d.date, d]))
  let moved = 0, deleted = 0, inserted = 0

  for (const wrong of wrongRecords) {
    const bucket = missingByDow.get(wrong.dayOfWeek)
    if (bucket && bucket.length > 0) {
      const target = bucket.shift()!
      try {
        await Day.updateOne({ _id: wrong._id }, { $set: { date: target.date } })
        stillMissing.delete(target.date)
        moved++
      } catch {
        // Unique-key conflict: a correct record already exists at target date.
        // The wrong record is now a duplicate — delete it.
        await Day.deleteOne({ _id: wrong._id })
        deleted++
      }
    } else {
      await Day.deleteOne({ _id: wrong._id })
      deleted++
    }
  }

  const toInsert = Array.from(stillMissing.values()).map(d => ({ ...d, userId }))
  if (toInsert.length > 0) {
    try {
      await Day.insertMany(toInsert, { ordered: false })
      inserted += toInsert.length
    } catch {
      // Ignore duplicate-key errors
    }
  }

  return { moved, deleted, inserted }
}

async function resyncDayDates() {
  const users = await User.find({
    onboardingCompleted: true,
    startDate: { $exists: true, $ne: '' },
    endDate:   { $exists: true, $ne: '' },
  }).lean()

  let totalMoved = 0, totalDeleted = 0, totalInserted = 0

  for (const user of users) {
    if (!user.startDate || !user.endDate) continue
    try {
      const result = await resyncDaysForUser(String(user._id), user.startDate, user.endDate)
      totalMoved    += result.moved
      totalDeleted  += result.deleted
      totalInserted += result.inserted
    } catch (err) {
      console.error(`[migration] resyncDayDates: error for user ${user._id}:`, err)
    }
  }

  console.log(`[migration] resyncDayDates: moved=${totalMoved} deleted=${totalDeleted} inserted=${totalInserted}`)
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
