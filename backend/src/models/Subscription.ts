import { Schema, model } from 'mongoose';

const billingHistorySchema = new Schema({
  invoiceId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['paid', 'failed', 'refunded'], required: true },
  transactionId: { type: String },
  plan: { type: String, required: true },
  billedAt: { type: Date, default: Date.now },
});

const subscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  plan: { type: String, enum: ['Free', 'Pro', 'Premium'], default: 'Free', index: true },
  status: { type: String, enum: ['active', 'inactive', 'canceled', 'expired'], default: 'inactive', index: true },
  razorpaySubscriptionId: { type: String, index: true, sparse: true },
  razorpayOrderId: { type: String, index: true, sparse: true },
  startDate: { type: Date, default: Date.now },
  renewalDate: { type: Date },
  expiryDate: { type: Date },
  creditsUsed: { type: Number, default: 0 },
  billingHistory: [billingHistorySchema],
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
}, { timestamps: true });

export const Subscription = model('Subscription', subscriptionSchema);
export default Subscription;
