import { connectToDatabase } from './mongodb'
import Day from './models/Day'
import { generateWorkingDays } from './utils'

/**
 * Inserts all weekday Day records for a student's internship period.
 * Uses ordered:false insertMany so duplicate dates are silently skipped
 * (safe to call multiple times / idempotent).
 * Returns the number of newly inserted days.
 */
export async function seedDaysForUser(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<number> {
  await connectToDatabase()

  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0

  const dayDocs = generateWorkingDays(start, end).map(day => ({ ...day, userId }))
  if (dayDocs.length === 0) return 0

  try {
    const result = await Day.insertMany(dayDocs, { ordered: false })
    return result.length
  } catch (err: unknown) {
    // MongoBulkWriteError means some were inserted and some were duplicates — that is fine
    if (
      err &&
      typeof err === 'object' &&
      'name' in err &&
      (err as { name: string }).name === 'MongoBulkWriteError'
    ) {
      const bulkErr = err as { insertedDocs?: unknown[] }
      return bulkErr.insertedDocs?.length ?? 0
    }
    throw err
  }
}
