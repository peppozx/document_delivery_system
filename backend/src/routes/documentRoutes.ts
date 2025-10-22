import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import { upload } from '../config/multer';

const router = Router();
const documentController = new DocumentController();

router.use(authMiddleware);

// Upload document (with rate limiting)
router.post(
  '/upload',
  uploadRateLimiter,
  upload.single('file'),
  documentController.uploadDocument.bind(documentController)
);

// Download document
router.get(
  '/download/:id',
  documentController.downloadDocument.bind(documentController)
);

// Get sent documents
router.get(
  '/sent',
  documentController.getSentDocuments.bind(documentController)
);

// Get received documents
router.get(
  '/received',
  documentController.getReceivedDocuments.bind(documentController)
);

// Get document metadata
router.get(
  '/:id',
  documentController.getDocument.bind(documentController)
);

// Delete document
router.delete(
  '/:id',
  documentController.deleteDocument.bind(documentController)
);

export default router;
