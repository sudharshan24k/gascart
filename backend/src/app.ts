import express from 'express';
import cors from 'cors';
import { config } from './config/env';
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

const app = express();

console.log('[App] Initializing with config:', JSON.stringify({
    port: config.port,
    env: config.env,
    supabaseUrl: config.supabase.url,
    hasServiceKey: !!config.supabase.serviceKey
}, null, 2));

// Middleware
app.use(cors());
// Routes that need raw body (webhooks) must be before express.json()
app.use('/api/v1/webhooks/stripe', webhookRoutes);

app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Bespoke E-commerce API is running 🚀', version: '1.0.0' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});


app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes); // Auth handled in controller for guest support
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

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Error] ${req.method} ${req.url}:`, err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(config.env === 'development' && { stack: err.stack })
    });
});

// Start Server
// Server startup moved to server.ts for Vercel compatibility

export default app;
