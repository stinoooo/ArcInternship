import mongoose, { Types } from 'mongoose'
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

  // Wipe every existing record for this user.
  // Use $or to catch records stored with userId as either ObjectId or plain string
  // (older partial migrations may have stored the wrong type).
  let objectIdUserId: Types.ObjectId | null = null
  try { objectIdUserId = new Types.ObjectId(userId) } catch { /* not a valid ObjectId */ }

  const userIdFilter = objectIdUserId
    ? { $or: [{ userId: objectIdUserId }, { userId: userId }] }
    : { userId }

  const deleteResult = await Day.deleteMany(userIdFilter)
  const deleted = deleteResult.deletedCount ?? 0

  // Upsert each day individually so a single conflict cannot block the rest.
  // This handles any leftover documents with mismatched userId types.
  const toInsert = correctDays.map(d => ({ ...d, userId }))
  let inserted = 0
  const failedDates: string[] = []

  for (const doc of toInsert) {
    try {
      await Day.findOneAndUpdate(
        { date: doc.date, userId: doc.userId },
        { $set: doc },
        { upsert: true, new: true },
      )
      inserted++
    } catch (err) {
      failedDates.push(doc.date)
      console.error(`[resync] failed to upsert ${doc.date} for user ${userId}:`, err)
    }
  }

  if (failedDates.length > 0) {
    console.error(`[resync] ${failedDates.length} failed dates for user ${userId}:`, failedDates)
  }

  return { deleted, inserted, failed: failedDates.length }
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

/**
 * Drop the legacy unique index on `date` alone (without userId) created by
 * the old seed script. This rogue index prevents the app from inserting
 * user-owned day records when a date already exists, causing only 4 out of 5
 * weekdays to be saved per week. After dropping it, resync all users so
 * every week gets the full Monday–Friday set.
 */
async function dropLegacyDateIndexAndResync() {
  // Drop the rogue date_1 unique index if it exists
  try {
    await mongoose.connection.collection('days').dropIndex('date_1')
    console.log('[migration] Dropped legacy date_1 unique index')
  } catch (_e) {
    // Index may not exist — that is fine
  }

  // Remove orphan day records that have no userId (created by the old seed script)
  try {
    const result = await Day.deleteMany({ userId: { $exists: false } })
    const result2 = await Day.deleteMany({ userId: null })
    console.log(`[migration] Removed ${(result.deletedCount ?? 0) + (result2.deletedCount ?? 0)} orphan day records without userId`)
  } catch (_e) { /* ignore */ }

  // Resync all users to ensure every week has all 5 weekdays (Mon–Fri)
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
      console.error(`[migration] dropLegacyDateIndexAndResync: error for user ${user._id}:`, err)
    }
  }

  console.log(`[migration] dropLegacyDateIndexAndResync: deleted=${totalDeleted} inserted=${totalInserted}`)
}

const MIGRATIONS: { name: string; run: () => Promise<void> }[] = [
  { name: 'fixDayDateOffset',  run: fixDayDateOffset  },
  { name: 'resyncDayDates',    run: resyncDayDates     },
  { name: 'resyncDayDates_v3', run: resyncDayDates_v3  },
  { name: 'dropLegacyDateIndexAndResync', run: dropLegacyDateIndexAndResync },
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
