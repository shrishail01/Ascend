import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ATSService from '../services/ats.service';
import { sendResponse } from '../utils/response';
import { createAuditLog } from '../utils/audit';

const atsService = new ATSService();

/**
 * Controller for ATS Analysis.
 */
export class ATSController {
  async analyzeATS(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await atsService.analyzeATS(req.user._id.toString(), req.body);
      await createAuditLog(req.user._id.toString(), 'ATS Analysis', req);
      return sendResponse(res, 200, {
        success: true,
        message: 'ATS analysis completed!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await atsService.getHistory(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async optimizeATS(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await atsService.optimizeATS(req.user._id.toString(), req.body);
      return sendResponse(res, 200, {
        success: true,
        message: 'Resume optimized successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async optimizeBullets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await atsService.optimizeBullets(req.user._id.toString(), req.body);
      return sendResponse(res, 200, {
        success: true,
        message: 'Bullet points optimized successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default ATSController;
