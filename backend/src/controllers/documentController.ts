import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { DocumentService } from '../services/documentService';
import { EncryptionService } from '../services/encryptionService';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

export class DocumentController {
  private documentService = new DocumentService();
  private encryptionService = new EncryptionService();
  private userService = new UserService();

  /**
   * Upload and encrypt a document
   * POST /api/documents/upload
   */
  async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const { recipient_id, view_limit, expires_at } = req.body;
      // FEATURE: Sensitive documents - We would need to add the is_sensitive and access_password to the request body
      /*
        const { is_sensitive, access_password } = req.body;
        if (is_sensitive) {
          if (!access_password) {
            return res.status(400).json({
              success: false,
              error: 'Access password is required for sensitive documents'
            });
          }
        }
      */

      const senderId = req.user?.id;

      if (!senderId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!recipient_id) {
        return res.status(400).json({
          success: false,
          error: 'recipient_id is required'
        });
      }

      const recipient = await this.userService.findById(recipient_id);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          error: 'Recipient user not found'
        });
      }

      const tempFilePath = req.file.path;
      const fileBuffer = await fs.readFile(tempFilePath);

      const encryptionResult = this.encryptionService.encryptFile(fileBuffer);

      const encryptedFilename = this.encryptionService.generateEncryptedFilename(
        req.file.originalname
      );

      let expiresAt: Date | undefined;
      if (expires_at) {
        expiresAt = new Date(expires_at);
        if (isNaN(expiresAt.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid expires_at date format'
          });
        }
      }

      const encryptedFilePath = path.join(
        __dirname,
        '../../uploads/documents',
        encryptedFilename
      );
      await fs.writeFile(encryptedFilePath, encryptionResult.encryptedData);

      await fs.unlink(tempFilePath);

      // FEATURE: Sensitive documents - Here we need to hash the access_password if it is provided
      /*
        let access_password_hash: string | undefined;
        if (is_sensitive) {
          const passwordHashed = await this.authService.hashPassword(access_password);
          access_password_hash = passwordHashed;
        }
      */

      const document = await this.documentService.create({
        filename: req.file.originalname,
        encrypted_filename: encryptedFilename,
        mime_type: req.file.mimetype,
        size: req.file.size,
        sender_id: senderId,
        recipient_id: recipient_id,
        encryption_iv: encryptionResult.iv,
        encryption_auth_tag: encryptionResult.authTag,
        view_limit: view_limit ? parseInt(view_limit) : undefined,
        expires_at: expiresAt
        // FEATURE: Sensitive documents - Here we need to add the is_sensitive and access_password_hash to the request body
        // isSensitive: is_sensitive,
        // accessPasswordHash: access_password_hash
      });

      logger.info(`Document uploaded: ${document.id} from ${senderId} to ${recipient_id}`);

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          document: {
            id: document.id,
            filename: document.filename,
            size: document.size,
            recipient_id: document.recipient_id,
            view_limit: document.view_limit,
            expires_at: document.expires_at,
            created_at: document.created_at
          }
        }
      });
    } catch (error) {
      logger.error('Upload error:', error);
      next(error);
    }
  }

  /**
   * Download and decrypt a document
   * GET /api/documents/download/:id
   */
  async downloadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // FEATURE: Sensitive documents - We would need to change the request method to POST and add the access_password to the request body
      // const { access_password } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Get document
      const document = await this.documentService.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // Check access permissions
      const accessCheck = this.documentService.canAccess(document, userId);
      if (!accessCheck.canAccess) {
        return res.status(403).json({
          success: false,
          error: accessCheck.reason
        });
      }

      // Read encrypted file
      const encryptedFilePath = this.documentService.getDocumentPath(document.encrypted_filename);
      const encryptedData = await fs.readFile(encryptedFilePath);


      // FEATURE: Sensitive documents - We would need to decrypt the access_password_hash to check if the access_password is correct
      // if (document.is_sensitive) {
      //   if (!access_password) {
      //     return res.status(400).json({
      //       success: false,
      //       error: 'Access password is required for sensitive documents'
      //     });
      //   }

      //   const passwordHashed = await this.authService.comparePassword(access_password, document.access_password_hash);
      //   if (!passwordHashed) {
      //     return res.status(400).json({
      //       success: false,
      //       error: 'Invalid access password'
      //     });
      //   }
      // }

      // Decrypt file
      const decryptedData = this.encryptionService.decryptFile(
        encryptedData,
        document.encryption_iv,
        document.encryption_auth_tag
      );

      // Increment view count (only for recipient)
      if (userId === document.recipient_id) {
        await this.documentService.incrementViewCount(document.id);

        // Check if document should be deleted after this view
        document.view_count += 1; // Update local copy for check
        await this.documentService.checkAndDeleteIfNeeded(document);
      }

      // Send file
      res.setHeader('Content-Type', document.mime_type);
      res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
      res.send(decryptedData);

      logger.info(`Document downloaded: ${document.id} by ${userId}`);
    } catch (error) {
      logger.error('Download error:', error);
      next(error);
    }
  }

  /**
   * Get documents sent by current user
   * GET /api/documents/sent
   */
  async getSentDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const documents = await this.documentService.findSentByUser(userId);

      res.json({
        success: true,
        data: {
          documents: documents.map(doc => ({
            id: doc.id,
            filename: doc.filename,
            size: doc.size,
            mime_type: doc.mime_type,
            recipient: {
              id: doc.recipient.id,
              username: doc.recipient.username,
              email: doc.recipient.email
            },
            view_count: doc.view_count,
            view_limit: doc.view_limit,
            expires_at: doc.expires_at,
            created_at: doc.created_at
          }))
        }
      });
    } catch (error) {
      logger.error('Get sent documents error:', error);
      next(error);
    }
  }

  /**
   * Get documents received by current user
   * GET /api/documents/received
   */
  async getReceivedDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const documents = await this.documentService.findReceivedByUser(userId);

      res.json({
        success: true,
        data: {
          documents: documents.map(doc => ({
            id: doc.id,
            filename: doc.filename,
            size: doc.size,
            mime_type: doc.mime_type,
            sender: {
              id: doc.sender.id,
              username: doc.sender.username,
              email: doc.sender.email
            },
            view_count: doc.view_count,
            view_limit: doc.view_limit,
            expires_at: doc.expires_at,
            created_at: doc.created_at
          }))
        }
      });
    } catch (error) {
      logger.error('Get received documents error:', error);
      next(error);
    }
  }

  /**
   * Get document metadata
   * GET /api/documents/:id
   */
  async getDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const document = await this.documentService.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // Check access permissions
      const accessCheck = this.documentService.canAccess(document, userId);
      if (!accessCheck.canAccess) {
        return res.status(403).json({
          success: false,
          error: accessCheck.reason
        });
      }

      res.json({
        success: true,
        data: {
          document: {
            id: document.id,
            filename: document.filename,
            size: document.size,
            mime_type: document.mime_type,
            sender: {
              id: document.sender.id,
              username: document.sender.username,
              email: document.sender.email
            },
            recipient: {
              id: document.recipient.id,
              username: document.recipient.username,
              email: document.recipient.email
            },
            view_count: document.view_count,
            view_limit: document.view_limit,
            expires_at: document.expires_at,
            created_at: document.created_at
          }
        }
      });
    } catch (error) {
      logger.error('Get document error:', error);
      next(error);
    }
  }

  /**
   * Delete a document (sender only)
   * DELETE /api/documents/:id
   */
  async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const document = await this.documentService.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // Only sender can delete
      if (document.sender_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Only the sender can delete this document'
        });
      }

      await this.documentService.deleteDocument(document.id, document.encrypted_filename);

      logger.info(`Document deleted: ${document.id} by ${userId}`);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      logger.error('Delete document error:', error);
      next(error);
    }
  }
}
