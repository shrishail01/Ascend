import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const Notification = model('Notification', notificationSchema);
export default Notification;
