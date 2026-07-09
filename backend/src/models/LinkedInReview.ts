import { Schema, model } from 'mongoose';

const linkedInReviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  profileSection: { type: String, required: true }, // e.g., 'headline', 'about', 'experience'
  originalText: { type: String, required: true },
  suggestions: { type: String, default: '[]' }, // Serialized JSON array of suggestions details
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const LinkedInReview = model('LinkedInReview', linkedInReviewSchema);
export default LinkedInReview;
