import express, { Router } from 'express';
import SubscriptionController from '../controllers/subscription.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { createSubscriptionSchema } from '../validators/subscriptions';

const router = Router();
const controller = new SubscriptionController();

// Unauthenticated Webhook receiver (verified via signature check)
router.post('/webhook', express.json(), controller.handleWebhook);

router.use(protect);
router.get('/', controller.getSubscription);
router.get('/billing', controller.getBillingInfo);
router.post('/', validate(createSubscriptionSchema), controller.createSubscription);
router.post('/verify', controller.verifyPayment);
router.post('/check-access', controller.checkFeatureAccess);

export default router;
