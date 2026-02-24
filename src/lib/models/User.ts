import mongoose, { Schema, Document, Model } from 'mongoose'
import { IUser } from '@/types'

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['guest', 'student', 'teacher', 'admin'],
      default: 'student',
    },
    approved: { type: Boolean, default: false },
    language: { type: String, enum: ['nl', 'en'], default: 'nl' },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    avatarUrl: { type: String, default: '' },
    // Onboarding fields
    onboardingCompleted: { type: Boolean, default: false },
    internshipPlace: { type: String, default: '' },
    schoolName: { type: String, default: '' },
    studentEmail: { type: String, default: '' },
    requiredHours: { type: Number, default: 760 },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    supervisorContact: { type: String, default: '' },
    // Invite tracking
    inviteCode: { type: String, unique: true, sparse: true },
    invitedByUsername: { type: String, default: '' },
  },
  { timestamps: true }
)

const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)

export default User
