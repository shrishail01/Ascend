import { Router } from 'express';
import UsersController from '../controllers/users.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { updateSettingsSchema } from '../validators/settings';

const router = Router();
const controller = new UsersController();

router.use(protect);
router.patch('/', validate(updateSettingsSchema), controller.updateMe);

export default router;
