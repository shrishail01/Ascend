import logger from '../utils/logger';

/**
 * Background job to check and process queued notifications dispatch.
 */
export function runNotificationJob() {
  logger.info('JOB: Starting queued alerts dispatch job...');
}
