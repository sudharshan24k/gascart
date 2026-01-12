import { Router } from 'express';
import { addToCart, getCart, updateCartItem, removeCartItem } from '../controllers/cart.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Cart is mixed auth/public (guest)
// We handle auth inside controller or via flexible middleware if complex
// For now, let's keep it open but use auth middleware optionally if we had one that didn't block
// Simplified: Use a custom wrapper or just check req.headers in controller as implemented.
// But to populate req.user, we need the middleware.
// Let's make a "optionalAuth" middleware or just use logic in controller for guests.
// For this MVP, let's assuming guests don't send Bearer token. 

// Guest/User agnostic
router.post('/', addToCart);
router.get('/', getCart);
router.patch('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);

export default router;
