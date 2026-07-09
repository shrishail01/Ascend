import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ProjectService from '../services/project.service';
import { sendResponse } from '../utils/response';

const projectService = new ProjectService();

/**
 * Controller for portfolio project recommendation operations.
 */
export class ProjectController {
  async suggestProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await projectService.suggestProjects(req.user._id.toString(), req.body);
      return sendResponse(res, 200, {
        success: true,
        message: 'Portfolio projects generated!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await projectService.getHistory(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default ProjectController;
