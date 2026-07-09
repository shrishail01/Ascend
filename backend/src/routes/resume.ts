import { Router } from 'express';
import ResumeController from '../controllers/resume.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { saveResumeSchema } from '../validators/resume';

const router = Router();
const controller = new ResumeController();

router.use(protect);
router.get('/', controller.getResumes);
router.get('/:id', controller.getResume);
router.post('/', validate(saveResumeSchema), controller.saveResume);
router.delete('/:id', controller.deleteResume);
router.post('/:id/duplicate', controller.duplicateResume);

export default router;
