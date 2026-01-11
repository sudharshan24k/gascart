import { Router } from 'express';
import { getArticles, getArticle, createArticle, updateArticle, deleteArticle } from '../controllers/articles.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getArticles);
router.get('/:slug', getArticle);

// Admin routes
router.post('/', requireAuth, requireAdmin, createArticle);
router.patch('/:id', requireAuth, requireAdmin, updateArticle);
router.delete('/:id', requireAuth, requireAdmin, deleteArticle);

export default router;
