import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';
import { sendResponse } from '../utils/response';

/**
 * Global centralized error handling middleware.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the exception stack using Winston logger
  logger.error(`Error processing request: ${message} [Status: ${statusCode}]`, {
    requestId: req.id,
    stack: err.stack,
    url: req.originalUrl,
  });

  return sendResponse(res, statusCode, {
    success: false,
    message,
    data: process.env.NODE_ENV === 'development' ? { stack: err.stack } : null,
  });
}
export default errorHandler;
