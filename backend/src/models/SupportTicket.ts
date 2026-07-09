import { Schema, model } from 'mongoose';

const resolutionHistorySchema = new Schema({
  status: { type: String, required: true },
  note: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

const supportTicketSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },
  status: { type: String, enum: ['open', 'assigned', 'resolved', 'closed'], default: 'open', index: true },
  type: { type: String, enum: ['bug', 'feature', 'contact'], default: 'contact', index: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  internalNotes: { type: String, default: '' },
  resolutionHistory: [resolutionHistorySchema],
}, { timestamps: true });

export const SupportTicket = model('SupportTicket', supportTicketSchema);
export default SupportTicket;
