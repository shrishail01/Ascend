import { Router } from 'express';
import CoverLetterController from '../controllers/coverLetter.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { generateCoverLetterSchema } from '../validators/coverLetter';

const router = Router();
const controller = new CoverLetterController();

router.use(protect);
router.post('/generate', validate(generateCoverLetterSchema), controller.generateCoverLetter);
router.get('/', controller.getCoverLetters);
router.delete('/:id', controller.deleteCoverLetter);

export default router;
