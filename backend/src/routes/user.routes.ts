import { Router } from 'express';
import { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/me', getProfile);
router.patch('/me', updateProfile);

// Address Management
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.patch('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

export default router;
