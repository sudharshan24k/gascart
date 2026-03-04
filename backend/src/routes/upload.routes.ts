import { Router } from 'express';
import multer from 'multer';
import { uploadFile, deleteFile, renameFile, listFiles } from '../controllers/upload.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/v1/upload/:bucket/files
// List files in a bucket using backend service role key to bypass RLS
router.get('/:bucket/files', requireAuth, listFiles);

// POST /api/v1/upload/:bucket
// Note: We might want requireAdmin for most buckets, but maybe not for avatars.
// For now, let's keep it restricted to authenticated users.
router.post('/:bucket', requireAuth, upload.single('file'), uploadFile);

// POST /api/v1/upload/:bucket/rename
router.post('/:bucket/rename', requireAuth, renameFile);

// DELETE /api/v1/upload/:bucket
// Expects JSON { "path": "filename.ext" }
router.delete('/:bucket', requireAuth, deleteFile);

export default router;
