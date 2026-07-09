import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import CoverLetterService from '../services/coverLetter.service';
import { sendResponse } from '../utils/response';

const clService = new CoverLetterService();

/**
 * Controller for Cover Letter operations.
 */
export class CoverLetterController {
  async generateCoverLetter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await clService.generateCoverLetter(req.user._id.toString(), req.body);
      return sendResponse(res, 200, {
        success: true,
        message: 'Cover letter generated successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCoverLetters(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await clService.getCoverLetters(req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCoverLetter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await clService.deleteCoverLetter(req.params.id as string, req.user._id.toString());
      return sendResponse(res, 200, {
        success: true,
        message: 'Cover letter deleted successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default CoverLetterController;
