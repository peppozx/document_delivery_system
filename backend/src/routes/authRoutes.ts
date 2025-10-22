import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRegister, validateLogin, validateRefreshToken } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

router.use(authRateLimiter);

router.post(
  '/register',
  validateRegister,
  authController.register.bind(authController)
);

router.post(
  '/login',
  validateLogin,
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validateRefreshToken,
  authController.refreshToken.bind(authController)
);

router.post(
  '/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

router.get(
  '/me',
  authMiddleware,
  authController.getProfile.bind(authController)
);

export default router;
