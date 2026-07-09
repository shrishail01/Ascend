import { Router } from 'express';
import DashboardController from '../controllers/dashboard.controller';
import protect from '../middleware/auth';

const router = Router();
const controller = new DashboardController();

router.use(protect);
router.get('/stats', controller.getStats);

export default router;
