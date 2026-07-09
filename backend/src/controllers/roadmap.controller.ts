import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import RoadmapService from '../services/roadmap.service';
import { sendResponse } from '../utils/response';

const roadmapService = new RoadmapService();

/**
 * Controller for Career Roadmap operations.
 */
export class RoadmapController {
  async generateRoadmap(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await roadmapService.generateRoadmap(req.user._id.toString(), req.body);
      return sendResponse(res, 200, {
        success: true,
        message: 'Career roadmap generated successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await roadmapService.getHistory(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async suggestRoles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await roadmapService.suggestRoles(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateSOP(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await roadmapService.generateSOP(req.user._id.toString(), req.body);
      return sendResponse(res, 200, {
        success: true,
        message: 'Statement of Purpose generated successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default RoadmapController;
