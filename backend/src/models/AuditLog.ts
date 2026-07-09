import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true }, // e.g., 'login', 'create_resume', 'upgrade'
  requestId: { type: String, index: true },
  details: { type: String }, // Additional event parameters stored as text/JSON
  ipAddress: { type: String },
  userAgent: { type: String },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const AuditLog = model('AuditLog', auditLogSchema);
export default AuditLog;
