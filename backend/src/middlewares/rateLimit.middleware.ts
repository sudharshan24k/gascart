import { Request, Response, NextFunction } from 'express';

/**
 * Lightweight in-memory rate limiter.
 * No external dependency required.
 * For production at scale, swap this with `express-rate-limit` backed by Redis.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Prune stale entries every 5 minutes to avoid unbounded memory growth
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) store.delete(key);
    }
}, 5 * 60 * 1000);

/**
 * Creates a rate-limit middleware.
 * @param maxRequests Maximum requests allowed within the window
 * @param windowMs    Time window in milliseconds
 */
export const rateLimit = (maxRequests: number, windowMs: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            req.socket.remoteAddress ||
            'unknown';

        const now = Date.now();
        const entry = store.get(ip);

        if (!entry || entry.resetAt < now) {
            store.set(ip, { count: 1, resetAt: now + windowMs });
            return next();
        }

        entry.count += 1;

        if (entry.count > maxRequests) {
            const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
            res.setHeader('Retry-After', String(retryAfterSec));
            return res.status(429).json({
                status: 'error',
                message: 'Too many requests. Please try again later.',
                retryAfterSeconds: retryAfterSec
            });
        }

        next();
    };
};
