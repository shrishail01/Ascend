import logger from '../utils/logger';

/**
 * Background job to sync user subscription plans and active status limits.
 */
export function runSubscriptionJob() {
  logger.info('JOB: Starting subscription active status syncing job...');
}
