import mongoose, { Schema, Document, Model } from 'mongoose'

export interface MigrationDocument extends Document {
  name: string
  ranAt: Date
}

const MigrationSchema = new Schema<MigrationDocument>({
  name: { type: String, required: true, unique: true },
  ranAt: { type: Date, default: Date.now },
})

const Migration: Model<MigrationDocument> =
  mongoose.models.Migration || mongoose.model<MigrationDocument>('Migration', MigrationSchema)

export default Migration
