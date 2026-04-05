import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { rateLimit } from './middlewares/rateLimit.middleware';
import productRoutes from './routes/products.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import consultantRoutes from './routes/consultants.routes';
import adminRoutes from './routes/admin.routes';
import articleRoutes from './routes/articles.routes';
import rfqRoutes from './routes/rfqs.routes';
import categoryRoutes from './routes/categories.routes';
import vendorRoutes from './routes/vendors.routes';
import documentRoutes from './routes/documents.routes';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import webhookRoutes from './routes/webhook.routes';
import uploadRoutes from './routes/upload.routes';
import careerRoutes from './routes/careers.routes';

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
// helmet sets HSTS, X-Frame-Options, X-Content-Type-Options, CSP, and more.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc:  ["'self'"],
            styleSrc:   ["'self'", "'unsafe-inline'"],
            imgSrc:     ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", config.supabase.url],
            objectSrc:  ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
    },
    crossOriginEmbedderPolicy: false, // Allow Supabase storage embeds
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Restrict origins to the configured frontend URL only.
// In development a localhost fallback is added for convenience.
const allowedOrigins: string[] = [config.frontendUrl, config.adminUrl].filter(Boolean);
if (config.env === 'development') {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

app.use(cors({
    origin: (incomingOrigin, callback) => {
        // Allow server-to-server requests (no Origin header) and allowed origins
        if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin '${incomingOrigin}' is not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Global Rate Limiting ─────────────────────────────────────────────────────
// 300 requests per minute per IP across all API routes.
// Tighter limits on specific sensitive routes are applied at the router level.
app.use('/api/', rateLimit(300, 60_000));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
// Routes that need raw body (webhooks) must be registered BEFORE express.json()
app.use('/api/v1/webhooks/razorpay', webhookRoutes);
app.use(express.json({ limit: '2mb' }));

// ─── Health Checks ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'Bespoke E-commerce API is running 🚀', version: '1.0.0' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

// Minimal health endpoint — no internal config details exposed
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Backend is running',
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
try {
    app.use('/api/v1/products', productRoutes);
    app.use('/api/v1/cart', cartRoutes);
    app.use('/api/v1/orders', orderRoutes);
    app.use('/api/v1/consultants', consultantRoutes);
    app.use('/api/v1/admin', adminRoutes);
    app.use('/api/v1/articles', articleRoutes);
    app.use('/api/v1/rfqs', rfqRoutes);
    app.use('/api/v1/categories', categoryRoutes);
    app.use('/api/v1/vendors', vendorRoutes);
    app.use('/api/v1/documents', documentRoutes);
    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/payments', paymentRoutes);
    app.use('/api/v1/upload', uploadRoutes);
    app.use('/api/v1/careers', careerRoutes);
} catch (routeError) {
    console.error('[App] Failed to initialize routes:', routeError);
}

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Log the full error server-side, but never expose internals to the caller
    console.error(`[Error] ${req.method} ${req.url}:`, err);

    // Suppress CORS error detail from the response body
    if (err.message?.startsWith('CORS:')) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        // Stack traces only in development, never in production
        ...(config.env === 'development' && { stack: err.stack }),
    });
});

export default app;
