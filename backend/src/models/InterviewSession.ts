import { Schema, model } from 'mongoose';

const interviewSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobTitle: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  type: { type: String, enum: ['hr', 'technical', 'behavioral'], required: true },
  questions: { type: String, required: true, default: '[]' }, // Serialized JSON questions, responses, feedback
  score: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const InterviewSession = model('InterviewSession', interviewSessionSchema);
export default InterviewSession;
