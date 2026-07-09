import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware that appends a unique UUID to every request,
 * enabling correlation logging across services.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const reqId = (req.header('x-request-id') || uuidv4()) as string;
  req.id = reqId;
  res.setHeader('x-request-id', reqId);
  next();
}
