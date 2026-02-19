import mongoose from 'mongoose'

const MONGODB_URI = process.env.DATABASE_URL!

if (!MONGODB_URI) {
  throw new Error('DATABASE_URL environment variable is not set')
}

interface GlobalMongoose {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: GlobalMongoose | undefined
}

const cached: GlobalMongoose = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'arcinternship',
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
