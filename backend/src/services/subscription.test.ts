process.env.NODE_ENV = 'test';

import SubscriptionService from './subscription.service';
import Subscription from '../models/Subscription';
import User from '../models/User';
import FeatureUsage from '../models/FeatureUsage';

// Mock Mongoose model interactions
const mockSub: any = {
  plan: 'Pro',
  status: 'inactive',
  billingHistory: [],
  save: () => Promise.resolve(),
};

(Subscription as any).findOne = () => Promise.resolve(mockSub);
(Subscription as any).updateOne = () => Promise.resolve({});
(User as any).updateOne = () => Promise.resolve({});
(User as any).findById = () =>
  Promise.resolve({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' });
(FeatureUsage as any).findOne = () => Promise.resolve(null);
(FeatureUsage as any).create = () =>
  Promise.resolve({ count: 0, limit: 5, save: () => Promise.resolve() });
(FeatureUsage as any).updateOne = () => Promise.resolve({});

/**
 * Validates the core subscription activation, payment verification, and webhook signals.
 */
async function runSubscriptionTests() {
  console.log('--- STARTING COMMERCIAL SAAS LAYER SUBSCRIPTION TESTS ---');
  const service = new SubscriptionService();

  // Test 1: Create Order
  console.log('Testing createOrder...');
  const order = await service.createOrder('dummy-user', 'Pro');
  if (order.amount === 8900 && order.currency === 'INR') {
    console.log('✓ createOrder Passed');
  } else {
    throw new Error('createOrder Failed');
  }

  // Test 2: Verify Payment
  console.log('Testing verifyPayment...');
  const verification = await service.verifyPayment('dummy-user', {
    razorpayOrderId: order.orderId,
    razorpayPaymentId: 'pay_dummy123',
    razorpaySignature: 'dummy-sig',
  });
  if (verification.success && (verification.plan === 'Pro' || verification.plan === 'Premium')) {
    console.log('✓ verifyPayment Passed');
  } else {
    throw new Error('verifyPayment Failed');
  }

  // Test 3: Webhook Verification (payment.captured)
  console.log('Testing webhook payment.captured event...');
  const webhookRes = await service.handleWebhook(
    {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_captured123',
            order_id: order.orderId,
            amount: 8900,
          },
        },
      },
    },
    'dummy-sig'
  );
  if (webhookRes.received) {
    console.log('✓ webhook captured event Passed');
  } else {
    throw new Error('webhook captured event Failed');
  }

  // Test 4: Check Feature Access
  console.log('Testing checkFeatureAccess...');
  const access = await service.checkFeatureAccess('dummy-user', 'ats');
  if (access.allowed && access.limit === 9999) {
    console.log('✓ checkFeatureAccess limits validation Passed');
  } else {
    throw new Error('checkFeatureAccess Failed');
  }

  // Test 5: Get Billing Info
  console.log('Testing getBillingInfo aggregates...');
  const billingInfo = await service.getBillingInfo('dummy-user');
  if ((billingInfo.plan === 'Pro' || billingInfo.plan === 'Premium') && billingInfo.planDetails.priceINR === 89) {
    console.log('✓ getBillingInfo Passed');
  } else {
    throw new Error('getBillingInfo Failed');
  }

  console.log('--- ALL SUBSCRIPTION LAYER TEST SUITES PASSED SUCCESSFULLY ---');
  process.exit(0);
}

runSubscriptionTests().catch((err) => {
  console.error('Subscription test suite failed:', err);
  process.exit(1);
});
