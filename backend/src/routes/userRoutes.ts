import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const userController = new UserController();

// Get all users (protected)
router.get('/', authMiddleware, userController.getUsers);

export default router;
