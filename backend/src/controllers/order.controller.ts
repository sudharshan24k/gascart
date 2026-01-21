import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import PDFDocument from 'pdfkit';

// Helper to get User ID safely
const getUserId = (req: Request) => (req as any).user.id;

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { shipping_address, billing_address, payment_method } = req.body;

        // 1. Get Cart
        const { data: cart, error: cartError } = await supabase
            .from('carts')
            .select('*, cart_items(*, product:products(*))') // Fetch items and product details (price)
            .eq('user_id', userId)
            .single();

        if (cartError || !cart || !cart.cart_items || cart.cart_items.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'Cart is empty' });
        }

        // 2. Calculate Total (Server side verification)
        // 2. Calculate Total (Server side verification)
        const total_amount = cart.cart_items.reduce((sum: number, item: any) => {
            const variantPrice = item.selected_variant?.price;
            const finalPrice = variantPrice !== undefined ? variantPrice : item.product.price;
            return sum + (item.quantity * finalPrice);
        }, 0);

        // 3. Create Order (Using RPC or sequential inserts - Supabase RPC is best for transaction but we'll do sequential for now if RPC not set up, but we assume no race condition for MVP single user session)
        // Ideally we wrap this in a postgres transaction function, but for Node logic:

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                total_amount,
                shipping_address,
                billing_address: billing_address || shipping_address, // Default to shipping
                status: 'pending',
                payment_status: 'unpaid' // In real app, we mark paid after Stripe webhook
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 4. Create Order Items
        // 4. Create Order Items
        const orderItems = cart.cart_items.map((item: any) => {
            // If variant has specific price, use it. Otherwise use product base price.
            // Assuming variant object has 'price' key if it overrides.
            const variantPrice = item.selected_variant?.price;
            const finalPrice = variantPrice !== undefined ? variantPrice : item.product.price;

            return {
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: finalPrice,
                selected_variant: item.selected_variant // Copy the snapshot
            };
        });

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 5. Deduct Stock
        for (const item of orderItems) {
            if (item.selected_variant) {
                // Deduct from variant
                const { error: variantStockError } = await supabase.rpc('deduct_variant_stock', {
                    variant_id: item.selected_variant.id,
                    qty: item.quantity
                });
                if (variantStockError) console.error('Failed to deduct variant stock:', variantStockError);
            } else {
                // Deduct from product
                const { error: productStockError } = await supabase.rpc('deduct_product_stock', {
                    prod_id: item.product_id,
                    qty: item.quantity
                });
                if (productStockError) console.error('Failed to deduct product stock:', productStockError);
            }
        }

        // 6. Clear Cart (Delete Cart Items)
        const { error: clearCartError } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);

        if (clearCartError) throw clearCartError;

        res.status(201).json({
            status: 'success',
            data: {
                order_id: order.id
            }
        });

    } catch (err) {
        next(err);
    }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, product:products(name, image))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ status: 'success', results: data.length, data });
    } catch (err) {
        next(err);
    }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*, product:products(name))')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Manually fetch profiles
        const userIds = [...new Set(orders.map((o: any) => o.user_id))];
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);

        if (profileError) throw profileError;

        const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
        const data = orders.map((o: any) => ({
            ...o,
            profiles: profileMap.get(o.user_id) || { full_name: 'Unknown', email: 'Unknown' }
        }));

        res.json({ status: 'success', results: data.length, data });
    } catch (err) {
        next(err);
    }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, payment_status } = req.body;

        const updates: any = {};
        if (status) updates.status = status;
        if (payment_status) updates.payment_status = payment_status;

        const { data, error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, product:products(name, image, description))')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ status: 'fail', message: 'Order not found' });

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const downloadInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const userRole = (req as any).user.role;
        const { id } = req.params;

        // Fetch order with items
        let query = supabase
            .from('orders')
            .select('*, order_items(*, product:products(name))')
            .eq('id', id);

        // If not admin, restrict to owner
        if (userRole !== 'admin') {
            query = query.eq('user_id', userId);
        }

        const { data: order, error } = await query.single();

        if (error || !order) {
            return res.status(404).json({ status: 'fail', message: 'Order not found' });
        }

        // Fetch profile manually
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', order.user_id)
            .single();

        order.profiles = profile;

        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.id.slice(0, 8)}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('INVOICE', { align: 'right' });
        doc.fontSize(10).text('GASCART - Industrial E-commerce', { align: 'left' });
        doc.moveDown();

        // Order Info
        doc.text(`Invoice Number: INV-${order.id.slice(0, 8)}`);
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`);
        doc.text(`Status: ${order.status.toUpperCase()}`);
        doc.moveDown();

        // Customer Info
        doc.fontSize(12).text('Bill To:', { underline: true });
        doc.fontSize(10).text(order.profiles?.full_name || 'Customer');
        doc.text(order.profiles?.email || '');
        doc.text(order.billing_address || order.shipping_address);
        doc.moveDown();

        // Table Header
        const tableTop = 250;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, tableTop);
        doc.text('Quantity', 300, tableTop, { width: 90, align: 'right' });
        doc.text('Price', 400, tableTop, { width: 90, align: 'right' });
        doc.text('Total', 500, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
        doc.font('Helvetica');

        // Table Rows
        let currentHeight = tableTop + 25;
        order.order_items.forEach((item: any) => {
            doc.text(item.product?.name || 'Product', 50, currentHeight);
            doc.text(item.quantity.toString(), 300, currentHeight, { width: 90, align: 'right' });
            doc.text(`$${item.price_at_purchase.toFixed(2)}`, 400, currentHeight, { width: 90, align: 'right' });
            doc.text(`$${(item.quantity * item.price_at_purchase).toFixed(2)}`, 500, currentHeight, { align: 'right' });
            currentHeight += 20;
        });

        // Summary
        doc.moveTo(50, currentHeight + 10).lineTo(550, currentHeight + 10).stroke();
        doc.font('Helvetica-Bold');
        doc.text('Total Amount:', 400, currentHeight + 25);
        doc.text(`$${order.total_amount.toFixed(2)}`, 500, currentHeight + 25, { align: 'right' });

        doc.end();

    } catch (err) {
        next(err);
    }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        // 1. Get Order and Items
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (orderError || !order) {
            return res.status(404).json({ status: 'fail', message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ status: 'fail', message: 'Only pending orders can be cancelled' });
        }

        // 2. Update Status
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', id);

        if (updateError) throw updateError;

        // 3. Restore Stock
        for (const item of order.order_items) {
            if (item.selected_variant) {
                await supabase.rpc('restore_variant_stock', {
                    variant_id: item.selected_variant.id,
                    qty: item.quantity
                });
            } else {
                await supabase.rpc('restore_product_stock', {
                    prod_id: item.product_id,
                    qty: item.quantity
                });
            }
        }

        res.json({ status: 'success', message: 'Order cancelled and stock restored' });
    } catch (err) {
        next(err);
    }
};

export const updateTracking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { carrier, tracking_number } = req.body;

        const { data, error } = await supabase
            .from('orders')
            .update({ carrier, tracking_number, status: 'shipped' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const exportOrdersCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, total_amount, status, payment_status, created_at, user_id')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Manually fetch profiles
        const userIds = [...new Set(orders.map((o: any) => o.user_id))];
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);

        if (profileError) throw profileError;
        const profileMap = new Map(profiles.map((p: any) => [p.id, p]));

        // Simple CSV generation
        const headers = 'Order ID,Date,Customer,Email,Amount,Status,Payment Status\n';
        const rows = orders.map((o: any) => {
            const profile = profileMap.get(o.user_id);
            return `${o.id},${new Date(o.created_at).toISOString()},${profile?.full_name || ''},${profile?.email || ''},${o.total_amount},${o.status},${o.payment_status}`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
        res.send(headers + rows);
    } catch (err) {
        next(err);
    }
};
