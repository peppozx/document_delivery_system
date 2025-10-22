import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface EncryptionResult {
  encryptedData: Buffer;
  iv: string;
  authTag: string;
}

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;

  constructor() {
    const keyString = process.env.ENCRYPTION_KEY || this.generateKey();

    // Ensure key is 32 bytes for AES-256
    this.encryptionKey = crypto.scryptSync(keyString, 'salt', 32);

    if (!process.env.ENCRYPTION_KEY) {
      logger.warn('ENCRYPTION_KEY not set in environment. Using generated key for development only.');
    }
  }

  /**
   * Generate a random encryption key (for development only)
   */
  private generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt a file buffer using AES-256-GCM
   */
  encryptFile(fileBuffer: Buffer): EncryptionResult {
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(16);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      // Encrypt the file
      const encryptedData = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final()
      ]);

      // Get authentication tag (for GCM mode)
      const authTag = cipher.getAuthTag();

      return {
        encryptedData,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Failed to encrypt file');
    }
  }

  /**
   * Decrypt a file buffer using AES-256-GCM
   */
  decryptFile(encryptedData: Buffer, ivHex: string, authTagHex: string): Buffer {
    try {
      // Convert hex strings back to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);

      // Set authentication tag
      decipher.setAuthTag(authTag);

      // Decrypt the file
      const decryptedData = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
      ]);

      return decryptedData;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Failed to decrypt file. File may be corrupted or tampered with.');
    }
  }

  /**
   * Generate a random filename for storing encrypted files
   */
  generateEncryptedFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(16).toString('hex');
    const extension = originalFilename.split('.').pop() || 'enc';
    return `${timestamp}-${randomString}.${extension}.encrypted`;
  }
}
