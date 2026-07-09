import { Schema, model } from 'mongoose';

const refreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const RefreshToken = model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
