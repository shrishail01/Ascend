import logger from '../utils/logger';

/**
 * Background job to cleanup expired tokens and old audit logs.
 */
export function runCleanupJob() {
  logger.info('JOB: Starting database logs and expired tokens cleanup job...');
}
