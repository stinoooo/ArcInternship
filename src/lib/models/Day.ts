import mongoose, { Schema, Document, Model } from 'mongoose'
import { IDay } from '@/types'

export interface DayDocument extends Omit<IDay, '_id'>, Document {}

const DaySchema = new Schema<DayDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    date: { type: String, required: true },
    dayOfWeek: { type: Number, required: true },
    weekNumber: { type: Number, required: true },
    year: { type: Number, required: true },
    type: {
      type: String,
      enum: ['werkdag', 'thuiswerk', 'vrij', 'ziek', 'feestdag'],
      default: 'werkdag',
    },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    hours: { type: Number, default: 8 },
    activities: { type: String, default: '' },
    isComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Unique per student per date (sparse so legacy unowned docs can coexist)
DaySchema.index({ date: 1, userId: 1 }, { unique: true, sparse: true })

const Day: Model<DayDocument> =
  mongoose.models.Day || mongoose.model<DayDocument>('Day', DaySchema)

export default Day
