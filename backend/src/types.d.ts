import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: any; // You can replace 'any' with a Supabase User type if available
        }
    }
}
