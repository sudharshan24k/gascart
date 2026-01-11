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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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

// Start Server
// Server startup moved to server.ts for Vercel compatibility

export default app;
