import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { sendResponse } from '../utils/response';
import { createAuditLog } from '../utils/audit';

const authService = new AuthService();

/**
 * Controller managing authorization flows.
 */
export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);
      res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      await createAuditLog(result.user.id, 'Login (Signup)', req);
      return sendResponse(res, 201, {
        success: true,
        message: 'Account created successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      await createAuditLog(result.user.id, 'Login', req);
      return sendResponse(res, 200, {
        success: true,
        message: 'Logged in successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.refreshToken || req.cookies.refreshToken;
      const result = await authService.refresh(token);
      res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      return sendResponse(res, 200, {
        success: true,
        message: 'Token refreshed successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.refreshToken || req.cookies.refreshToken;
      if (token) {
        await authService.logout(token);
      }
      const userId = (req as any).user?._id?.toString() || 'anonymous';
      await createAuditLog(userId, 'Logout', req);
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return sendResponse(res, 200, {
        success: true,
        message: 'Logged out successfully!',
      });
    } catch (error) {
      next(error);
    }
  }
}
export default AuthController;
