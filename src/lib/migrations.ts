import Migration from './models/Migration'
import Day from './models/Day'

/**
 * Fix: Day records were stored with a UTC-shifted date due to toISOString() usage.
 * In UTC+1, midnight local time is 23:00 the previous day in UTC, so dates were
 * saved 1 day too early. The dayOfWeek field was correct (computed from local time),
 * so we detect mismatches and shift the date forward by 1 day.
 */
async function fixDayDateOffset() {
  const days = await Day.find({}).lean()
  const ops: object[] = []

  for (const day of days) {
    // Parse at noon to avoid any timezone edge cases during the check itself
    const expectedDow = new Date(day.date + 'T12:00:00').getDay()
    if (expectedDow !== day.dayOfWeek) {
      const d = new Date(day.date + 'T12:00:00')
      d.setDate(d.getDate() + 1)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const date = String(d.getDate()).padStart(2, '0')
      ops.push({
        updateOne: {
          filter: { _id: day._id },
          update: { $set: { date: `${year}-${month}-${date}` } },
        },
      })
    }
  }

  if (ops.length > 0) {
    await Day.bulkWrite(ops as Parameters<typeof Day.bulkWrite>[0])
    console.log(`[migration] fixDayDateOffset: corrected ${ops.length} day record(s)`)
  } else {
    console.log('[migration] fixDayDateOffset: nothing to correct')
  }
}

const MIGRATIONS: { name: string; run: () => Promise<void> }[] = [
  { name: 'fixDayDateOffset', run: fixDayDateOffset },
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
    // Migrations are non-fatal — log and continue
    console.error('[migration] error during migrations (non-fatal):', err)
  }
}
