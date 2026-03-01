import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory, permanentlyDeleteCategory } from '../controllers/categories.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getCategories);

// Admin routes
router.post('/', requireAuth, requireAdmin, createCategory);
router.patch('/:id', requireAuth, requireAdmin, updateCategory);
router.delete('/:id', requireAuth, requireAdmin, deleteCategory);                        // Soft delete
router.delete('/:id/permanent', requireAuth, requireAdmin, permanentlyDeleteCategory);   // Hard delete

export default router;
