import { Schema, model } from 'mongoose';

const coverLetterSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobTitle: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const CoverLetter = model('CoverLetter', coverLetterSchema);
export default CoverLetter;
