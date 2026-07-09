import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import ApiError from '../utils/ApiError';
import UsersRepository from '../repositories/UsersRepository';

const usersRepo = new UsersRepository();

export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Middleware that protects routes by validating Bearer authorization headers or cookie access tokens.
 * Automatically handles CSRF origin verification on modifying requests.
 */
export async function protect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication required. Please log in.'));
  }

  // Enforce CSRF checks on modifying methods using cookie auth
  const isWriteRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isCookieAuth = !req.headers.authorization && req.cookies && req.cookies.accessToken;

  if (isCookieAuth && isWriteRequest) {
    const origin = req.headers.origin as string;
    const referer = req.headers.referer as string;
    const clientUrl = env.CLIENT_URL;

    let isValid = false;
    if (origin && origin === clientUrl) {
      isValid = true;
    } else if (referer && referer.startsWith(clientUrl)) {
      isValid = true;
    }

    if (!isValid) {
      return next(new ApiError(403, 'CSRF verification failed: Origin/Referer mismatch.'));
    }
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await usersRepo.findById(decoded.userId);
    if (!user) {
      return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Session expired or invalid token. Please log in again.'));
  }
}

/**
 * Middleware to restrict route access to specific roles (e.g. Admin, User).
 */
export function restrictTo(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
}
export default protect;
