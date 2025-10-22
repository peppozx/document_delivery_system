import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Repository } from 'typeorm';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create a new user
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  /**
   * Update a user's data
   */
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return await this.findById(id);
  }

  /**
   * Update a user's refresh token
   */
  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(id, { refresh_token: refreshToken });
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected !== 0;
  }

  /**
   * Find all users with pagination
   */
  async findAll(options?: {
    skip?: number;
    take?: number;
    order?: any;
  }): Promise<[User[], number]> {
    return await this.userRepository.findAndCount({
      skip: options?.skip,
      take: options?.take,
      order: options?.order || { created_at: 'DESC' },
      select: ['id', 'email', 'username', 'role', 'is_active', 'created_at', 'updated_at']
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { username } });
    return count > 0;
  }
}
