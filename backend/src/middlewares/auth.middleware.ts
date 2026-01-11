import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
    user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid or expired token', error: error?.message });
        }

        req.user = user;
        next();
    } catch (err: any) {
        res.status(500).json({ message: 'Internal Server Error during authentication' });
    }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // First ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        // Check profile role
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            return res.status(403).json({ message: 'Failed to verify user role' });
        }

        if (profile.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        next();
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error during role check' });
    }
};
