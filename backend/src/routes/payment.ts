import express from 'express';

const router = express.Router();

/**
 * TODO: Implement backend Razorpay order creation in Phase 2.
 */
router.post('/order', (req, res) => {
  res.json({
    orderId: 'order_mock123',
    amount: 8900,
    currency: 'INR',
    keyId: 'rzp_test_mock',
    userName: 'John Doe',
    userEmail: 'user@example.com',
  });
});

/**
 * TODO: Implement backend Razorpay payment verification in Phase 2.
 */
router.post('/verify', (req, res) => {
  res.json({ success: true, plan: 'Premium' });
});

export default router;
