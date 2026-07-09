import { Schema, model } from 'mongoose';

const careerRoadmapSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  currentRole: { type: String, trim: true },
  targetRole: { type: String, required: true, trim: true },
  summary: { type: String },
  timelineMonths: { type: Number, default: 6 },
  skillGaps: { type: String, default: '[]' }, // Serialized JSON array of skills details
  milestones: { type: String, default: '[]' }, // Serialized JSON list of milestone items
  salaryRange: { 
    current: { type: String, default: '' },
    target: { type: String, default: '' }
  },
  certifications: { type: String, default: '[]' }, // Serialized JSON list of certifications
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const CareerRoadmap = model('CareerRoadmap', careerRoadmapSchema);
export default CareerRoadmap;
