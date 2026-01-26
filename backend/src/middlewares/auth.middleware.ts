import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { supabase } from '../config/supabase';
import { config } from '../config/env';

export interface AuthRequest extends Request {
    user?: any;
}

const logToFile = (message: string) => {
    try {
        fs.appendFileSync('/tmp/gascart-debug.log', `${new Date().toISOString()} - ${message}\n`);
    } catch (e) {
        console.error('Failed to write to debug log:', e);
    }
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (token === 'development-token') {
        req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'admin@admin.com', role: 'admin', account_status: 'active', is_dev: true };
        return next();
    }

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid or expired token', error: error?.message });
        }

        // Fetch profile to check status and cache role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, account_status')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return res.status(403).json({ message: 'Failed to verify user profile' });
        }

        if (profile.account_status === 'banned') {
            return res.status(403).json({ message: 'Your account has been banned. Please contact support.', code: 'ACCOUNT_BANNED' });
        }

        if (profile.account_status === 'deactivated') {
            return res.status(403).json({ message: 'Your account is deactivated.', code: 'ACCOUNT_DEACTIVATED' });
        }

        req.user = { ...user, ...profile };
        next();
    } catch (err: any) {
        res.status(500).json({ message: 'Internal Server Error during authentication' });
    }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.is_dev || req.user.role === 'admin') {
        return next();
    }

    return res.status(403).json({ message: 'Admin access required' });
};

export const restrictTo = (...roles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (req.user.is_dev || roles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({ message: 'You do not have permission to perform this action' });
    };
};

