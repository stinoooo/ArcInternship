/**
 * Next.js instrumentation hook — called once when the server process starts.
 * The actual migration is fired in the background (fire-and-forget) so it
 * never blocks or delays server startup, even if the DB is slow to respond.
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Intentionally NOT awaited — runs in background after startup completes
  runMigration().catch(err =>
    console.error('[ArcStage] Startup migration error:', err),
  )
}

async function runMigration() {
  try {
    const { connectToDatabase } = await import('@/lib/mongodb')
    await connectToDatabase()

    const mongoose = await import('mongoose')
    const db = mongoose.default.connection.db
    if (!db) return

    const usersCol = db.collection('users')
    const daysCol = db.collection('days')

    const unownedCount = await daysCol.countDocuments({ userId: { $exists: false } })
    if (unownedCount === 0) return

    const adminUser = await usersCol.findOne({ email: 'stijn@stinoo.dev' })
    if (!adminUser) {
      console.warn('[ArcStage] Migration: user stijn@stinoo.dev not found — skipping')
      return
    }

    const result = await daysCol.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUser._id } },
    )
    console.log(
      `[ArcStage] Startup migration: assigned ${result.modifiedCount} unowned day(s) → ${adminUser.email}`,
    )
  } catch (err) {
    console.error('[ArcStage] Startup migration failed:', err)
  }
}
