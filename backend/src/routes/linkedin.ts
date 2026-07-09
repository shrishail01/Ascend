import { Router } from 'express';
import LinkedInController from '../controllers/linkedin.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { reviewLinkedInSchema } from '../validators/linkedin';

const router = Router();
const controller = new LinkedInController();

router.use(protect);
router.post('/review', validate(reviewLinkedInSchema), controller.reviewProfile);
router.get('/history', controller.getHistory);

export default router;
