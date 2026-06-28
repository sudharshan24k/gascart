import { Router } from 'express';
import {
    submitProducerCapacity,
    getProducerCapacities,
    updateProducerCapacity,
    deleteProducerCapacity
} from '../controllers/producers.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { supabase } from '../config/supabase';

const router = Router();

// Middleware to optionally authenticate and populate req.user if a token is present
const optionalAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, account_status')
                .eq('id', user.id)
                .single();

            if (profile && profile.account_status !== 'banned' && profile.account_status !== 'deactivated') {
                req.user = { ...user, ...profile };
            }
        }
    } catch (err) {
        // Ignore error and continue as guest
    }
    next();
};

// GET is accessible by anyone, but uses optionalAuth to check if the caller is an admin
router.get('/', optionalAuth, getProducerCapacities);

// POST allows authenticated users to submit capacity data
router.post('/', requireAuth, submitProducerCapacity);

// Admin-only endpoints
router.patch('/:id', requireAuth, requireAdmin, updateProducerCapacity);
router.delete('/:id', requireAuth, requireAdmin, deleteProducerCapacity);

export default router;
