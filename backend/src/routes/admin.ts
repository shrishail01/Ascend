import { Router } from 'express';
import protect from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import AdminController from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

// Secure all admin routes with authentication protect
router.use(protect);

router.get('/stats', requirePermission('analytics.view'), controller.getDashboardStats);
router.get('/users', requirePermission('users.read'), controller.getUsers);
router.get('/users/:userId/timeline', requirePermission('users.read'), controller.getUserTimeline);
router.put('/users/:userId/limits', requirePermission('users.update'), controller.updateUserPlanLimits);

router.get('/ai/config', requirePermission('ai.manage'), controller.getAIConfig);
router.put('/ai/config', requirePermission('ai.manage'), controller.updateAIConfig);

router.get('/tickets', requirePermission('support.manage'), controller.getSupportTickets);
router.put('/tickets/:ticketId', requirePermission('support.manage'), controller.updateSupportTicket);

router.get('/audit', requirePermission('logs.view'), controller.getAuditLogs);
router.get('/export', requirePermission('system.manage'), controller.exportData);
router.get('/search', requirePermission('users.read'), controller.globalSearch);

export default router;
