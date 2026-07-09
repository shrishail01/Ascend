import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { Subscription } from '../models/Subscription';
import SystemConfig from '../models/SystemConfig';
import { FeatureUsage } from '../models/FeatureUsage';
import { subscriptionPlans } from '../config/plans.config';
import ApiError from '../utils/ApiError';

/**
 * Parameterized Express middleware enforcing plan limits and feature access checks.
 */
export function checkFeatureAccess(featureName: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id.toString();

      // 1. Centralized Feature Toggles flag checks (SystemConfig)
      const config = await SystemConfig.findOne();
      if (config) {
        const flag = config.featureFlags.find(f => f.featureName === featureName);
        if (flag && flag.enabled === false) {
          throw new ApiError(403, `Feature ${featureName} is currently disabled by system administrator.`);
        }
      }

      // 2. Fetch Subscription and Plan configurations
      const sub = await Subscription.findOne({ userId });
      const planName = sub ? sub.plan : 'Free';
      const planConfig = subscriptionPlans[planName];
      if (!planConfig) {
        throw new ApiError(500, `Unknown subscription plan: ${planName}`);
      }

      // 3. Extract limit properties and check counts
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
        throw new ApiError(
          403,
          `AI_LIMIT_EXCEEDED: You have reached the monthly limit of ${usage.limit} requests for ${featureName} under your ${planName} plan.`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export default checkFeatureAccess;
