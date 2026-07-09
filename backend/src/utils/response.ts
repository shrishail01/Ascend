import { Response } from 'express';

export interface StandardResponseOptions<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    [key: string]: any;
  };
}

/**
 * Utility function to send standardized Express API JSON responses.
 */
export function sendResponse<T>(
  res: Response,
  statusCode: number,
  options: StandardResponseOptions<T>
) {
  const requestId = (res.req as any)?.id;
  const responseBody = {
    success: options.success,
    message: options.message || '',
    data: options.data !== undefined ? options.data : null,
    meta: {
      requestId,
      ...options.meta,
    },
  };
  return res.status(statusCode).json(responseBody);
}
