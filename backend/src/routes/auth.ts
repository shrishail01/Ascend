import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import validate from '../middleware/validate';
import { signupSchema, loginSchema, refreshSchema } from '../validators/auth';

const router = Router();
const controller = new AuthController();

router.post('/signup', validate(signupSchema), controller.signup);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.post('/logout', controller.logout);

export default router;
