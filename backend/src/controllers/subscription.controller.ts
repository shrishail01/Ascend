import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import SubscriptionService from '../services/subscription.service';
import { sendResponse } from '../utils/response';
import { createAuditLog } from '../utils/audit';

const subscriptionService = new SubscriptionService();

/**
 * Controller for managing user billing, pricing order generation, verification, and webhooks.
 */
export class SubscriptionController {
  async getSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.getSubscription(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates a Razorpay checkout order for the chosen tier.
   */
  async createSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.createOrder(req.user._id.toString(), req.body.plan);
      await createAuditLog(req.user._id.toString(), `Subscription Checkout Init (${req.body.plan})`, req);
      return sendResponse(res, 200, {
        success: true,
        message: 'Razorpay order created successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.verifyPayment(req.user._id.toString(), req.body);
      await createAuditLog(req.user._id.toString(), 'Subscription Upgraded (Success)', req);
      return sendResponse(res, 200, {
        success: true,
        message: 'Payment verification completed successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkFeatureAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.checkFeatureAccess(
        req.user._id.toString(),
        req.body.feature,
        req.body.increment
      );
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves user billing transaction invoice records and limits usage dashboard.
   */
  async getBillingInfo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.getBillingInfo(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles incoming Razorpay webhook payment updates.
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody || req.body;
      const result = await subscriptionService.handleWebhook(rawBody, signature);
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SubscriptionController;
