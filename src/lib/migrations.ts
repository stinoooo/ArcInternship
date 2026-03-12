import Migration from './models/Migration'
import Day from './models/Day'
import User from './models/User'
import { generateWorkingDays } from './utils'

/**
 * Original attempt — replaced by resyncDayDates which handles all cases correctly.
 * Kept here as a no-op so the migrations table entry is never re-used.
 */
async function fixDayDateOffset() {
  // superseded by resyncDayDates
}

/**
 * For every user with completed onboarding:
 * 1. Generate the correct set of working-day dates using the fixed code.
 * 2. Records on a WRONG date but with the right dayOfWeek → move to the correct date
 *    (preserves any hours/activities the user already filled in).
 * 3. Records that can't be matched to any correct date → delete.
 * 4. Correct dates that still have no record → insert with defaults.
 *
 * This handles both the original UTC-shift bug AND any records that were
 * incorrectly shifted by the earlier fixDayDateOffset migration.
 */
async function resyncDayDates() {
  const users = await User.find({
    onboardingCompleted: true,
    startDate: { $exists: true, $ne: '' },
    endDate:   { $exists: true, $ne: '' },
  }).lean()

  let moved = 0, deleted = 0, inserted = 0

  for (const user of users) {
    if (!user.startDate || !user.endDate) continue

    // Use noon to avoid any timezone edge case when parsing the boundary dates
    const start = new Date(user.startDate + 'T12:00:00')
    const end   = new Date(user.endDate   + 'T12:00:00')
    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue

    const correctDays = generateWorkingDays(start, end)
    const correctByDate = new Map(correctDays.map(d => [d.date, d]))

    const existing = await Day.find({ userId: user._id }).lean()

    // Split into records already on a correct date vs. wrong-date records
    const wrongRecords = existing.filter(r => !correctByDate.has(r.date))
    const coveredDates = new Set(existing.filter(r => correctByDate.has(r.date)).map(r => r.date))
    const missingDates = correctDays.filter(d => !coveredDates.has(d.date))

    // Group missing dates by dayOfWeek so we can match wrong records to them
    const missingByDow = new Map<number, typeof missingDates>()
    for (const md of missingDates) {
      if (!missingByDow.has(md.dayOfWeek)) missingByDow.set(md.dayOfWeek, [])
      missingByDow.get(md.dayOfWeek)!.push(md)
    }
    // Sort each bucket by date so we always take the earliest matching slot
    missingByDow.forEach(arr => arr.sort((a, b) => a.date.localeCompare(b.date)))

    const stillMissing = new Map(missingDates.map(d => [d.date, d]))

    for (const wrong of wrongRecords) {
      const bucket = missingByDow.get(wrong.dayOfWeek)
      if (bucket && bucket.length > 0) {
        const target = bucket.shift()!
        await Day.updateOne({ _id: wrong._id }, { $set: { date: target.date } })
        stillMissing.delete(target.date)
        moved++
      } else {
        await Day.deleteOne({ _id: wrong._id })
        deleted++
      }
    }

    // Insert any remaining correct dates that still have no record
    const toInsert = [...stillMissing.values()].map(d => ({ ...d, userId: user._id }))
    if (toInsert.length > 0) {
      try {
        await Day.insertMany(toInsert, { ordered: false })
        inserted += toInsert.length
      } catch {
        // Ignore duplicate-key errors from concurrent inserts
      }
    }
  }

  console.log(`[migration] resyncDayDates: moved=${moved} deleted=${deleted} inserted=${inserted}`)
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
