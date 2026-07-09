import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendResponse } from '../utils/response';
import Resume from '../models/Resume';
import ATSAnalysis from '../models/ATSAnalysis';
import JobApplication from '../models/JobApplication';
import CoverLetter from '../models/CoverLetter';
import InterviewSession from '../models/InterviewSession';
import AuditLog from '../models/AuditLog';

/**
 * Controller for gathering platform analytics stats.
 */
export class DashboardController {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user._id;

      // 1. Fetch Resumes Count
      const resumeCount = await Resume.countDocuments({ userId, isDeleted: false });

      // 2. Fetch ATS Analytics
      const atsAnalyses = await ATSAnalysis.find({ userId, isDeleted: false }).sort({ createdAt: -1 });
      const avgAtsScore = atsAnalyses.length > 0 
        ? Math.round(atsAnalyses.reduce((acc, curr) => acc + curr.score, 0) / atsAnalyses.length)
        : 0;

      const recentAnalyses = atsAnalyses.slice(0, 5).map(a => ({
        id: a._id.toString(),
        title: `ATS Scan (${a.score} Score)`,
        matchScore: a.score,
        createdAt: a.createdAt,
      }));

      // 3. Fetch Job Tracker Pipeline
      const jobs = await JobApplication.find({ userId, isDeleted: false });
      const applicationCount = jobs.length;

      const statusMap: Record<string, number> = { Wishlist: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
      jobs.forEach(j => {
        if (statusMap[j.status] !== undefined) {
          statusMap[j.status]++;
        }
      });
      const applicationsByStatus = Object.keys(statusMap).map(status => ({
        status,
        count: statusMap[status]
      }));

      // 4. Fetch Cover Letters Count
      const coverLetterCount = await CoverLetter.countDocuments({ userId, isDeleted: false });

      // 5. Fetch Mock Interview Sessions
      const interviews = await InterviewSession.find({ userId, isDeleted: false });
      const interviewCount = interviews.length;
      const avgInterviewScore = interviews.length > 0
        ? Math.round(interviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / interviews.length)
        : 0;

      // 6. Fetch Recent Audit Logs Timeline
      const auditLogs = await AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(10);
      const recentActivity = auditLogs.map(log => ({
        id: log._id.toString(),
        action: log.action,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      }));

      const stats = {
        resumeCount,
        avgAtsScore,
        applicationCount,
        applicationsByStatus,
        coverLetterCount,
        interviewCount,
        avgInterviewScore,
        recentAnalyses,
        recentActivity
      };

      return sendResponse(res, 200, {
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default DashboardController;
