import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRegister, validateLogin, validateRefreshToken } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

// Public routes
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

// Protected routes
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
