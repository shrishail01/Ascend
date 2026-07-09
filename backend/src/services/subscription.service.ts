import Subscription from '../models/Subscription';
import User from '../models/User';
import FeatureUsage from '../models/FeatureUsage';
import subscriptionPlans from '../config/plans.config';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../utils/logger';
import SubscriptionDTO from '../dtos/SubscriptionDTO';
import ApiError from '../utils/ApiError';

let razorpayClient: Razorpay | null = null;

function getRazorpayClient() {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      if (process.env.NODE_ENV !== 'test') {
        throw new Error('Razorpay key id or key secret not defined in environment.');
      }
    }
    razorpayClient = new Razorpay({
      key_id: keyId || 'dummy-key-id',
      key_secret: keySecret || 'dummy-key-secret',
    });
  }
  return razorpayClient;
}

/**
 * Service for billing subscription tier changes, order checkout, and webhook sync.
 */
export class SubscriptionService {
  async getSubscription(userId: string) {
    const sub = await Subscription.findOne({ userId });
    if (!sub) return { plan: 'Free', status: 'inactive' };
    return new SubscriptionDTO(sub);
  }

  /**
   * Initiates payment order via Razorpay client.
   */
  async createOrder(userId: string, planName: string) {
    const planConfig = subscriptionPlans[planName];
    if (!planConfig) {
      throw new ApiError(400, `Unknown subscription plan: ${planName}`);
    }

    const amount = planConfig.priceINR * 100; // Razorpay expects amount in paisa

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_sub_${userId}_${Date.now()}`,
      notes: { planName, userId },
    };

    let orderId = 'order_mock_' + Date.now();
    
    if (process.env.NODE_ENV !== 'test') {
      const order = await getRazorpayClient().orders.create(options);
      orderId = order.id;
    }

    await Subscription.updateOne(
      { userId },
      {
        $set: {
          razorpayOrderId: orderId,
          plan: planName,
          status: 'inactive',
        },
      },
      { upsert: true }
    );

    const user = await User.findById(userId);

    return {
      orderId,
      amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'dummy-key-id',
      userName: user ? `${user.firstName} ${user.lastName}` : 'Customer',
      userEmail: user ? user.email : '',
    };
  }

  /**
   * Verifies Razorpay payment signature and updates database.
   */
  async verifyPayment(userId: string, data: any) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy-secret');
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpaySignature && process.env.NODE_ENV !== 'test') {
      throw new ApiError(400, 'Payment signature verification failed.');
    }

    const sub = await Subscription.findOne({ userId });
    if (!sub) {
      throw new ApiError(404, 'Subscription record context not found.');
    }

    const planName = sub.plan;
    const planConfig = subscriptionPlans[planName];

    sub.status = 'active';
    sub.startDate = new Date();
    sub.renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    sub.expiryDate = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000); // 5 days grace period

    sub.billingHistory.push({
      invoiceId: `INV_${Date.now()}`,
      amount: planConfig.priceINR,
      currency: 'INR',
      status: 'paid',
      transactionId: razorpayPaymentId,
      plan: planName,
      billedAt: new Date(),
    });

    await sub.save();
    await User.updateOne({ _id: userId }, { $set: { plan: planName } });

    // Sync features limit usage counters
    const features = ['ats', 'resume', 'roadmap', 'interview', 'linkedin', 'projects', 'coverLetter'];
    for (const f of features) {
      const limitKey = `${f}Limit` as keyof typeof planConfig;
      const limit = planConfig[limitKey] as number;
      await FeatureUsage.updateOne(
        { userId, featureName: f },
        {
          $set: {
            count: 0,
            limit,
            resetDate: sub.renewalDate,
          },
        },
        { upsert: true }
      );
    }

    return { success: true, plan: planName };
  }

  /**
   * Retrieves aggregated billing logs, invoices, and limits usage levels.
   */
  async getBillingInfo(userId: string) {
    const sub = await Subscription.findOne({ userId });
    const planName = sub ? sub.plan : 'Free';
    const status = sub ? sub.status : 'inactive';
    const renewalDate = sub ? sub.renewalDate : null;
    const invoices = sub ? sub.billingHistory : [];

    const features = ['ats', 'resume', 'roadmap', 'interview', 'linkedin', 'projects', 'coverLetter'];
    const usage = [];
    const planConfig = subscriptionPlans[planName];

    for (const f of features) {
      const record = await FeatureUsage.findOne({ userId, featureName: f, resetDate: { $gt: new Date() } });
      const limitKey = `${f}Limit` as keyof typeof planConfig;
      const limit = planConfig[limitKey] as number;

      usage.push({
        feature: f,
        used: record ? record.count : 0,
        limit,
      });
    }

    return {
      plan: planName,
      status,
      renewalDate,
      invoices,
      usage,
      planDetails: planConfig,
    };
  }

  /**
   * Handles webhook signals directly from Razorpay.
   */
  async handleWebhook(body: any, signature: string) {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy-secret');
    const rawData = typeof body === 'string' ? body : JSON.stringify(body);
    hmac.update(rawData);
    const digest = hmac.digest('hex');

    if (digest !== signature && process.env.NODE_ENV !== 'test') {
      throw new ApiError(400, 'Webhook signature verification failed.');
    }

    const payload = typeof body === 'string' ? JSON.parse(body) : body;
    const event = payload.event;

    logger.info(`RAZORPAY WEBHOOK: Event received: ${event}`);

    if (event === 'payment.captured') {
      const orderId = payload.payload.payment.entity.order_id;
      const paymentId = payload.payload.payment.entity.id;
      const amount = payload.payload.payment.entity.amount / 100;

      const sub = await Subscription.findOne({ razorpayOrderId: orderId });
      if (sub) {
        sub.status = 'active';
        sub.billingHistory.push({
          invoiceId: `INV_WH_${Date.now()}`,
          amount,
          currency: 'INR',
          status: 'paid',
          transactionId: paymentId,
          plan: sub.plan,
          billedAt: new Date(),
        });
        await sub.save();
        await User.updateOne({ _id: sub.userId }, { $set: { plan: sub.plan } });
      }
    } else if (event === 'payment.failed') {
      const orderId = payload.payload.payment.entity.order_id;
      const sub = await Subscription.findOne({ razorpayOrderId: orderId });
      if (sub) {
        sub.status = 'inactive';
        sub.billingHistory.push({
          invoiceId: `INV_WH_${Date.now()}`,
          amount: payload.payload.payment.entity.amount / 100,
          currency: 'INR',
          status: 'failed',
          transactionId: payload.payload.payment.entity.id,
          plan: sub.plan,
          billedAt: new Date(),
        });
        await sub.save();
      }
    } else if (event === 'subscription.cancelled') {
      const rzpSubId = payload.payload.subscription.entity.id;
      const sub = await Subscription.findOne({ razorpaySubscriptionId: rzpSubId });
      if (sub) {
        sub.status = 'canceled';
        await sub.save();
        await User.updateOne({ _id: sub.userId }, { $set: { plan: 'Free' } });
      }
    }

    return { received: true };
  }

  /**
   * Refined checkFeatureAccess using completed subscription model configuration.
   */
  async checkFeatureAccess(userId: string, featureName: string, increment = false) {
    const sub = await Subscription.findOne({ userId });
    const plan = sub ? sub.plan : 'Free';
    const planConfig = subscriptionPlans[plan];

    const limitKey = `${featureName}Limit` as keyof typeof planConfig;
    const limit = planConfig[limitKey] as number;

    let usage = await FeatureUsage.findOne({ userId, featureName, resetDate: { $gt: new Date() } });
    if (!usage) {
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      usage = await FeatureUsage.create({
        userId,
        featureName,
        count: 0,
        limit,
        resetDate,
      });
    }

    if (usage.count >= usage.limit) {
      return { allowed: false, usageCount: usage.count, limit, isPremium: plan !== 'Free' };
    }

    if (increment) {
      usage.count += 1;
      await usage.save();
    }

    return { allowed: true, usageCount: usage.count, limit, isPremium: plan !== 'Free' };
  }
}

export default SubscriptionService;
