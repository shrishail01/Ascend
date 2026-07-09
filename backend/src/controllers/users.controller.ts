import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest } from '../middleware/auth';
import UsersRepository from '../repositories/UsersRepository';
import UserDTO from '../dtos/UserDTO';
import { sendResponse } from '../utils/response';
import ApiError from '../utils/ApiError';
import { createAuditLog } from '../utils/audit';

const usersRepo = new UsersRepository();

/**
 * Controller managing User entity profile operations.
 */
export class UsersController {
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthorized');
      return sendResponse(res, 200, {
        success: true,
        data: new UserDTO(req.user),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthorized');
      const updated = await usersRepo.update(req.user._id.toString(), req.body);
      await createAuditLog(req.user._id.toString(), 'Settings Update', req);
      return sendResponse(res, 200, {
        success: true,
        message: 'Profile updated successfully!',
        data: new UserDTO(updated),
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthorized');
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        throw new ApiError(400, 'Current password and new password are required.');
      }

      const isMatch = await bcrypt.compare(currentPassword, req.user.password);
      if (!isMatch) {
        throw new ApiError(400, 'Incorrect current password.');
      }

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);

      await usersRepo.update(req.user._id.toString(), { password: newHash });
      await createAuditLog(req.user._id.toString(), 'Password Change', req);

      return sendResponse(res, 200, {
        success: true,
        message: 'Password updated successfully!',
      });
    } catch (error) {
      next(error);
    }
  }
}
export default UsersController;
