import { AppDataSource } from '../config/database';
import { Document } from '../models/Document';
import { Repository, LessThan } from 'typeorm';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

export interface CreateDocumentDto {
  filename: string;
  encrypted_filename: string;
  mime_type: string;
  size: number;
  sender_id: string;
  recipient_id: string;
  encryption_iv: string;
  encryption_auth_tag: string;
  view_limit?: number;
  expires_at?: Date;
}

export class DocumentService {
  private documentRepository: Repository<Document>;
  private readonly uploadsDir = path.join(__dirname, '../../uploads/documents');

  constructor() {
    this.documentRepository = AppDataSource.getRepository(Document);
  }

  /**
   * Create a new document record
   */
  async create(data: CreateDocumentDto): Promise<Document> {
    const document = this.documentRepository.create(data);
    return await this.documentRepository.save(document);
  }

  /**
   * Find document by ID with sender and recipient relations
   */
  async findById(id: string): Promise<Document | null> {
    return await this.documentRepository.findOne({
      where: { id },
      relations: ['sender', 'recipient']
    });
  }

  /**
   * Find documents sent by a user
   */
  async findSentByUser(userId: string): Promise<Document[]> {
    return await this.documentRepository.find({
      where: { sender_id: userId },
      relations: ['recipient'],
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Find documents received by a user
   */
  async findReceivedByUser(userId: string): Promise<Document[]> {
    return await this.documentRepository.find({
      where: { recipient_id: userId },
      relations: ['sender'],
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Check if a user can access a document
   */
  canAccess(document: Document, userId: string): { canAccess: boolean; reason?: string } {
    // Check if user is sender or recipient
    if (document.sender_id !== userId && document.recipient_id !== userId) {
      return { canAccess: false, reason: 'You do not have permission to access this document' };
    }

    // Check if document has expired
    if (document.expires_at && new Date() > new Date(document.expires_at)) {
      return { canAccess: false, reason: 'Document has expired' };
    }

    // Check if view limit has been reached (only for recipients viewing, not senders)
    if (
      userId === document.recipient_id &&
      document.view_limit !== null &&
      document.view_count >= document.view_limit
    ) {
      return { canAccess: false, reason: 'View limit has been reached' };
    }

    return { canAccess: true };
  }

  /**
   * Increment view count for a document
   */
  async incrementViewCount(documentId: string): Promise<void> {
    await this.documentRepository.increment({ id: documentId }, 'view_count', 1);
  }

  /**
   * Check if document should be deleted after viewing
   */
  async checkAndDeleteIfNeeded(document: Document): Promise<boolean> {
    let shouldDelete = false;

    // Check if expired
    if (document.expires_at && new Date() > new Date(document.expires_at)) {
      shouldDelete = true;
    }

    // Check if view limit reached (after increment)
    if (document.view_limit !== null && document.view_count >= document.view_limit) {
      shouldDelete = true;
    }

    if (shouldDelete) {
      await this.deleteDocument(document.id, document.encrypted_filename);
      logger.info(`Document ${document.id} auto-deleted (expired or view limit reached)`);
      return true;
    }

    return false;
  }

  /**
   * Delete a document and its file
   */
  async deleteDocument(documentId: string, encryptedFilename: string): Promise<void> {
    // Delete database record
    await this.documentRepository.delete(documentId);

    // Delete physical file
    try {
      const filePath = path.join(this.uploadsDir, encryptedFilename);
      await fs.unlink(filePath);
      logger.info(`Deleted file: ${encryptedFilename}`);
    } catch (error) {
      logger.error(`Failed to delete file ${encryptedFilename}:`, error);
    }
  }

  /**
   * Delete all expired documents
   */
  async deleteExpiredDocuments(): Promise<number> {
    const expiredDocuments = await this.documentRepository.find({
      where: {
        expires_at: LessThan(new Date())
      }
    });

    for (const doc of expiredDocuments) {
      await this.deleteDocument(doc.id, doc.encrypted_filename);
    }

    logger.info(`Deleted ${expiredDocuments.length} expired documents`);
    return expiredDocuments.length;
  }

  /**
   * Get document file path
   */
  getDocumentPath(encryptedFilename: string): string {
    return path.join(this.uploadsDir, encryptedFilename);
  }
}
