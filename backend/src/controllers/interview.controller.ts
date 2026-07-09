import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import InterviewService from '../services/interview.service';
import { sendResponse } from '../utils/response';
import { createAuditLog } from '../utils/audit';

const interviewService = new InterviewService();

/**
 * Controller for mock interview operations.
 */
export class InterviewController {
  async startSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await interviewService.startSession(req.user._id.toString(), req.body);
      await createAuditLog(req.user._id.toString(), 'Interview Session (Start)', req);
      return sendResponse(res, 200, {
        success: true,
        message: 'Interview session created successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async scoreAnswers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await interviewService.scoreAnswers(req.user._id.toString(), req.body);
      await createAuditLog(req.user._id.toString(), 'Interview Session (Score)', req);
      return sendResponse(res, 200, {
        success: true,
        message: 'Answers scored successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await interviewService.getHistory(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default InterviewController;
