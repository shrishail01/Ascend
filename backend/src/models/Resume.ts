import { Schema, model } from 'mongoose';

const resumeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  template: { type: String, required: true, default: 'modern' },
  content: { type: String, required: true, default: '{}' }, // Serialized JSON of section details
  versions: {
    type: [{
      versionId: { type: String, required: true },
      title: { type: String, required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const Resume = model('Resume', resumeSchema);
export default Resume;
