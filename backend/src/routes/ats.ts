import { Router } from 'express';
import ATSController from '../controllers/ats.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { analyzeATSSchema } from '../validators/ats';

const router = Router();
const controller = new ATSController();

router.use(protect);
router.post('/analyze', validate(analyzeATSSchema), controller.analyzeATS);
router.get('/history', controller.getHistory);
router.post('/optimize', controller.optimizeATS);
router.post('/optimize-bullets', controller.optimizeBullets);

export default router;
