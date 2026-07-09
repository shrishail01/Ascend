import { Router } from 'express';
import UsersController from '../controllers/users.controller';
import protect from '../middleware/auth';
import validate from '../middleware/validate';
import { updateSettingsSchema } from '../validators/settings';

const router = Router();
const controller = new UsersController();

router.use(protect);
router.get('/me', controller.getMe);
router.patch('/me', validate(updateSettingsSchema), controller.updateMe);
router.post('/me/change-password', controller.changePassword);

export default router;
