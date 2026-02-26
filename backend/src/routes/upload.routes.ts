import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/upload.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/v1/upload/:bucket
// Note: We might want requireAdmin for most buckets, but maybe not for avatars.
// For now, let's keep it restricted to authenticated users.
router.post('/:bucket', requireAuth, upload.single('file'), uploadFile);

export default router;
