import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validateRequest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), AuthController.resetPassword);

router.get('/me', authenticate, AuthController.getMe);
router.patch('/profile', authenticate, validateBody(updateProfileSchema), AuthController.updateProfile);
router.put('/change-password', authenticate, validateBody(changePasswordSchema), AuthController.changePassword);

export default router;

