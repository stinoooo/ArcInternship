import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChangelog {
  version: string   // e.g. "4.6.0"
  date: string      // YYYY-MM-DD
  nl: string[]      // Dutch changelog items
  en: string[]      // English changelog items
}

export interface ChangelogDocument extends Omit<IChangelog, '_id'>, Document {}

const ChangelogSchema = new Schema<ChangelogDocument>(
  {
    version: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    nl: [{ type: String }],
    en: [{ type: String }],
  },
  { timestamps: true }
)

const Changelog: Model<ChangelogDocument> =
  mongoose.models.Changelog || mongoose.model<ChangelogDocument>('Changelog', ChangelogSchema)

export default Changelog
