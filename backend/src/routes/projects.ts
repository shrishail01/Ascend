import { Router } from 'express';
import ProjectController from '../controllers/project.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { suggestProjectsSchema } from '../validators/projects';

const router = Router();
const controller = new ProjectController();

router.use(protect);
router.post('/suggest', validate(suggestProjectsSchema), controller.suggestProjects);
router.get('/history', controller.getHistory);

export default router;
