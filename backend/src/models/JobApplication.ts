import { Schema, model } from 'mongoose';

const jobApplicationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  jobUrl: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'Joined'], 
    default: 'Wishlist',
    index: true 
  },
  salary: { type: String, trim: true },
  notes: { type: String },
  appliedDate: { type: Date },
  reminderDate: { type: Date },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const JobApplication = model('JobApplication', jobApplicationSchema);
export default JobApplication;
