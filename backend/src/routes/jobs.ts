import { Router } from 'express';
import JobsController from '../controllers/jobs.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { saveJobSchema } from '../validators/jobs';

const router = Router();
const controller = new JobsController();

router.use(protect);
router.get('/', controller.getJobs);
router.post('/', validate(saveJobSchema), controller.saveJob);
router.delete('/:id', controller.deleteJob);

export default router;
