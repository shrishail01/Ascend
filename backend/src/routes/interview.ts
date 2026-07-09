import { Router } from 'express';
import InterviewController from '../controllers/interview.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { startInterviewSchema, scoreInterviewSchema } from '../validators/interview';

const router = Router();
const controller = new InterviewController();

router.use(protect);
router.post('/start', validate(startInterviewSchema), controller.startSession);
router.post('/score', validate(scoreInterviewSchema), controller.scoreAnswers);
router.get('/history', controller.getHistory);

export default router;
