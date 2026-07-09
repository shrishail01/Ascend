import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendResponse } from '../utils/response';

const router = Router();

/**
 * General health check endpoint.
 */
router.get('/health', (req: Request, res: Response) => {
  return sendResponse(res, 200, {
    success: true,
    message: 'App server is healthy.',
    data: { uptime: process.uptime() },
  });
});

/**
 * Liveness probe.
 */
router.get('/live', (req: Request, res: Response) => {
  return sendResponse(res, 200, {
    success: true,
    message: 'Server is running.',
  });
});

/**
 * Readiness probe checking active Mongoose connection.
 */
router.get('/ready', (req: Request, res: Response) => {
  const isConnected = mongoose.connection.readyState === 1;
  return sendResponse(res, isConnected ? 200 : 503, {
    success: isConnected,
    message: isConnected ? 'Database connection is ready.' : 'Database connection is not ready.',
  });
});

export default router;
