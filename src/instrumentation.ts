/**
 * Next.js instrumentation hook — runs once when the server process starts.
 * Migrates any legacy Day documents that have no userId to stijn@stinoo.dev.
 * This is a no-op after the first successful run (unowned days no longer exist).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  try {
    const { connectToDatabase } = await import('@/lib/mongodb')
    await connectToDatabase()

    // Use the raw mongoose connection so we don't need to re-import models
    const mongoose = await import('mongoose')
    const db = mongoose.default.connection.db
    if (!db) return

    const usersCol = db.collection('users')
    const daysCol = db.collection('days')

    // Check whether there is anything to migrate
    const unownedCount = await daysCol.countDocuments({ userId: { $exists: false } })
    if (unownedCount === 0) return

    // Find the target user
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
    // Non-fatal — app continues to work even if migration fails
    console.error('[ArcStage] Startup migration failed:', err)
  }
}
