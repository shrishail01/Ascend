import { Schema, model } from 'mongoose';

const featureUsageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  featureName: { type: String, required: true, index: true }, // e.g., 'resume', 'ats', 'interview'
  count: { type: Number, default: 0 },
  limit: { type: Number, default: 10 },
  resetDate: { type: Date, required: true },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const FeatureUsage = model('FeatureUsage', featureUsageSchema);
export default FeatureUsage;
