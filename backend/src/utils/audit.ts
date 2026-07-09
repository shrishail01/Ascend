import AuditLog from '../models/AuditLog';
import logger from './logger';

/**
 * Creates a database log entry for user and system audit trials.
 */
export async function createAuditLog(userId: string, action: string, req: any) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const requestId = req.id || 'none';

    await AuditLog.create({
      userId,
      action,
      ipAddress: Array.isArray(ip) ? ip[0] : ip,
      userAgent,
      requestId,
    });
  } catch (error) {
    logger.error('❌ AUDIT LOG: Failed to record audit log:', error);
  }
}
export default createAuditLog;
