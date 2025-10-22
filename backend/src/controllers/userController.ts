import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.find({
        where: { is_active: true },
        select: ['id', 'email', 'username', 'role'],
      });

      res.json({
        success: true,
        data: { users },
      });
    } catch (error: any) {
      logger.error('Failed to retrieve users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve users',
        message: error.message,
      });
    }
  };
}
