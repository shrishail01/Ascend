import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    lowercase: true,
    trim: true 
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['User', 'Admin', 'SuperAdmin', 'Support', 'Moderator', 'Finance'], default: 'User' },
  plan: { type: String, enum: ['Free', 'Pro', 'Premium'], default: 'Free' },
  linkedInUrl: { type: String, trim: true },
  currentRole: { type: String, trim: true },
  targetRole: { type: String, trim: true },
  featureUsage: { type: String, default: '{}' }, // JSON metrics usage limits
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const User = model('User', userSchema);
export default User;
