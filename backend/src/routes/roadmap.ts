import { Router } from 'express';
import RoadmapController from '../controllers/roadmap.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { generateRoadmapSchema } from '../validators/roadmap';

const router = Router();
const controller = new RoadmapController();

router.use(protect);
router.post('/generate', validate(generateRoadmapSchema), controller.generateRoadmap);
router.get('/history', controller.getHistory);
router.get('/suggest-roles', controller.suggestRoles);
router.post('/sop', controller.generateSOP);

export default router;
