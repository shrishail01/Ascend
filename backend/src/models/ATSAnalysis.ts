import { Schema, model } from 'mongoose';

const atsAnalysisSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', index: true },
  score: { type: Number, required: true },
  feedback: { type: String, required: true, default: '{}' }, // Serialized JSON score recommendations
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const ATSAnalysis = model('ATSAnalysis', atsAnalysisSchema);
export default ATSAnalysis;
