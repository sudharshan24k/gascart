import { Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from './auth.middleware';

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return next();
    }

    // Development bypass
    if (process.env.NODE_ENV === 'development' && authHeader === 'Bearer development-token') {
        req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'admin@admin.com' };
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (!error && user) {
            req.user = user;
        }
        // If error or no user, we just don't set req.user and let controller handle it
        next();
    } catch (err) {
        // Failing silently is preferred for optional auth, or we could log it
        next();
    }
};
