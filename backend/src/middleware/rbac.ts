import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { rolePermissions } from '../config/permissions.config';
import ApiError from '../utils/ApiError';

/**
 * Parameterized middleware verifying the logged-in user possesses the required permission.
 */
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required. Please log in.'));
    }

    const role = req.user.role || 'User';
    const permissions = rolePermissions[role] || [];

    if (!permissions.includes(permission)) {
      return next(
        new ApiError(403, `Forbidden: You do not have the required permission (${permission}) to perform this action.`)
      );
    }

    next();
  };
}

export default requirePermission;
