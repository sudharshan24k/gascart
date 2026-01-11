import { Router } from 'express';
import {
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument
} from '../controllers/documents.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (with optional auth for access control)
router.get('/', getDocuments);
router.get('/:id', getDocument);

// Admin routes
router.use(requireAuth);
router.use(requireAdmin);

router.post('/', createDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
