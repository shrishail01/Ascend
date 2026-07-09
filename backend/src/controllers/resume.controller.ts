import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ResumeService from '../services/resume.service';
import { sendResponse } from '../utils/response';
import { createAuditLog } from '../utils/audit';

const resumeService = new ResumeService();

/**
 * Controller for Resume operations.
 */
export class ResumeController {
  async getResumes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await resumeService.getResumes(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await resumeService.getResume(req.params.id as string, req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async saveResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id.toString();
      const isUpdate = !!(req.body.id || req.body._id);
      
      const result = await resumeService.saveResume(userId, req.body);
      
      // Audit log creation/modification events
      await createAuditLog(userId, isUpdate ? 'Resume Update' : 'Resume Create', req);

      return sendResponse(res, 200, {
        success: true,
        message: 'Resume saved successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id.toString();
      const result = await resumeService.deleteResume(req.params.id as string, userId);
      
      await createAuditLog(userId, 'Resume Delete', req);

      return sendResponse(res, 200, {
        success: true,
        message: 'Resume deleted successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async duplicateResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id.toString();
      const result = await resumeService.duplicateResume(req.params.id as string, userId);
      
      await createAuditLog(userId, 'Resume Create (Duplicate)', req);

      return sendResponse(res, 201, {
        success: true,
        message: 'Resume duplicated successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default ResumeController;
