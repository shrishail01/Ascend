import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import JobsService from '../services/jobs.service';
import { sendResponse } from '../utils/response';
import { createAuditLog } from '../utils/audit';

const jobsService = new JobsService();

/**
 * Controller for Job tracker pipeline log actions.
 */
export class JobsController {
  async getJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobsService.getJobs(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async saveJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobsService.saveJob(req.user._id.toString(), req.body);
      await createAuditLog(req.user._id.toString(), 'Job Application', req);
      return sendResponse(res, 200, {
        success: true,
        message: 'Job application saved successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await jobsService.deleteJob(req.params.id as string, req.user._id.toString());
      await createAuditLog(req.user._id.toString(), 'Job Application (Delete)', req);
      return sendResponse(res, 200, {
        success: true,
        message: 'Job application deleted successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default JobsController;
