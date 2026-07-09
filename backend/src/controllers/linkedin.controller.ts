import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import LinkedInService from '../services/linkedin.service';
import { sendResponse } from '../utils/response';

const linkedinService = new LinkedInService();

/**
 * Controller for LinkedIn profile reviews.
 */
export class LinkedInController {
  async reviewProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await linkedinService.reviewProfile(req.user._id.toString(), req.body);
      return sendResponse(res, 200, {
        success: true,
        message: 'LinkedIn profile section analyzed!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await linkedinService.getHistory(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default LinkedInController;
