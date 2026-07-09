import api from '@/services/axios';

export interface CheckFeatureAccessInput {
  feature: string;
  increment?: boolean;
}

export interface CheckFeatureAccessOutput {
  allowed: boolean;
  usageCount: number;
  limit: number;
  isPremium: boolean;
}

/**
 * Verifies if user has credit limits for active premium tools.
 */
export async function checkFeatureAccess(input: CheckFeatureAccessInput): Promise<CheckFeatureAccessOutput> {
  return api.post('/subscriptions/check-access', input);
}
export default checkFeatureAccess;
