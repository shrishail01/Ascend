import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import AdminService from '../services/admin.service';
import { sendResponse } from '../utils/response';
import { createAuditLog } from '../utils/audit';

const adminService = new AdminService();

/**
 * Controller class executing admin requests. Logs all operations audits.
 */
export class AdminController {
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      return sendResponse(res, 200, { success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = (req.query.search as string) || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await adminService.getUsers(search, page, limit);
      return sendResponse(res, 200, { success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getUserTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      const timeline = await adminService.getUserTimeline(userId);
      return sendResponse(res, 200, { success: true, data: timeline });
    } catch (error) {
      next(error);
    }
  }

  async updateUserPlanLimits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      const result = await adminService.updateUserPlanLimits(userId, req.body);
      await createAuditLog(req.user._id.toString(), `Admin Override User Limits (User: ${userId})`, req);
      return sendResponse(res, 200, { success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAIConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const config = await adminService.getAIConfig();
      return sendResponse(res, 200, { success: true, data: config });
    } catch (error) {
      next(error);
    }
  }

  async updateAIConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.updateAIConfig(req.body);
      await createAuditLog(req.user._id.toString(), 'Admin Updated AI Prompt & Model configs', req);
      return sendResponse(res, 200, { success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getSupportTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = (req.query.status as string) || '';
      const priority = (req.query.priority as string) || '';
      const search = (req.query.search as string) || '';

      const tickets = await adminService.getSupportTickets(status, priority, search);
      return sendResponse(res, 200, { success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  }

  async updateSupportTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ticketId = req.params.ticketId as string;
      const result = await adminService.updateSupportTicket(ticketId, req.body);
      await createAuditLog(req.user._id.toString(), `Admin Update Support Ticket (Ticket: ${ticketId})`, req);
      return sendResponse(res, 200, { success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = (req.query.search as string) || '';
      const action = (req.query.action as string) || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const logs = await adminService.getAuditLogs(search, action, page, limit);
      return sendResponse(res, 200, { success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  async exportData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const type = (req.query.type as string) || 'users';
      const data = await adminService.exportData(type);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=export_${type}_${Date.now()}.csv`);
      return res.status(200).send(data);
    } catch (error) {
      next(error);
    }
  }

  async globalSearch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const term = (req.query.q as string) || '';
      const results = await adminService.globalSearch(term);
      return sendResponse(res, 200, { success: true, data: results });
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;
