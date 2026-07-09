import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  skills: { type: [String], default: [] },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  timeEstimate: { type: String, trim: true },
  githubIdea: { type: String },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const Project = model('Project', projectSchema);
export default Project;
