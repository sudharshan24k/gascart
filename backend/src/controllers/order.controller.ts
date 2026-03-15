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
            // A vendor-specific price overrides both if present (as it is the price the user saw/agreed to)
            const variantPrice = item.selected_variant?.price;
            let finalPrice = variantPrice !== undefined ? variantPrice : item.product.price;

            if (item.vendor_price !== null && item.vendor_price !== undefined) {
                finalPrice = item.vendor_price;
            }

            return {
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: finalPrice,
                selected_variant: item.selected_variant, // Copy the snapshot
                vendor_id: item.vendor_id,
                vendor_price: item.vendor_price,
                vendor_sku: item.vendor_sku
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

        // 7. Send Email Notification (Async - do not block response)
        // Fetch user email if not in request
        supabase.from('profiles').select('email').eq('id', userId).single()
            .then(({ data: profile }) => {
                if (profile?.email) {
                    import('../services/email.service').then(({ sendOrderConfirmation }) => {
                        sendOrderConfirmation(profile.email, order.id, total_amount)
                            .catch((err: any) => console.error('Failed to send order confirmation email:', err));
                    });
                }
            });

    } catch (err) {
        next(err);
    }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { status, search, days } = req.query;

        let query = supabase
            .from('orders')
            .select('*, order_items(*, product:products(name, image))')
            .eq('user_id', userId);

        // Filter by Status
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        // Filter by Date Range
        if (days && days !== 'all') {
            const date = new Date();
            date.setDate(date.getDate() - parseInt(days as string));
            query = query.gte('created_at', date.toISOString());
        }

        // Search (Client-side filtering for joined tables is hard in Supabase without specific RPC or view, 
        // but for order ID it's easy. For product name it requires inner join filtering which is verbose.
        // Let's implement basic filtering here and maybe refined search later if needed.
        // Supabase .textSearch or .ilike is good for single table columns.)
        if (search) {
            query = query.ilike('id', `%${search}%`); // Search by Order ID
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // If search is provided, we might want to also filter by product name in memory 
        // because Supabase complex join filtering needs exact syntax or RPC.
        // Simple in-memory filter for product names if search is present:
        let filteredData = data;
        if (search) {
            const searchLower = (search as string).toLowerCase();
            filteredData = data.filter((order: any) => {
                // Match ID
                if (order.id.toLowerCase().includes(searchLower)) return true;
                // Match Product Names
                return order.order_items.some((item: any) =>
                    item.product?.name?.toLowerCase().includes(searchLower)
                );
            });
        }

        res.json({ status: 'success', results: filteredData.length, data: filteredData });
    } catch (err) {
        next(err);
    }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.query;
        let query = supabase
            .from('orders')
            .select('*, order_items(*, product:products(name, images))')
            .order('created_at', { ascending: false });

        if (status && status !== 'All') {
            query = query.eq('status', status);
        }

        const { data: orders, error } = await query;

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
        const { status, payment_status, paid_amount, balance_due } = req.body;

        const updates: any = {};
        if (status) updates.status = status;
        if (payment_status) updates.payment_status = payment_status;
        if (paid_amount !== undefined) updates.paid_amount = paid_amount;
        if (balance_due !== undefined) updates.balance_due = balance_due;

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
            .select('*, order_items(*, product:products(name, images, description))')
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

        // --- PDF Generation ---
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=GASCART-INV-${order.id.slice(0, 8)}.pdf`);

        doc.pipe(res);

        // 1. Header Section
        doc.fillColor('#0F172A').fontSize(28).font('Helvetica-Bold').text('GASCART', 50, 50);
        doc.fillColor('#64748B').fontSize(10).font('Helvetica').text('Industrial Ecommerce Solutions', 50, 80);
        doc.text('123 Industrial Ave, Tech City, 560001', 50, 95);
        doc.text('support@gascart.in | +91 234 567 8900', 50, 110);

        // Invoice Details (Right Aligned)
        doc.fillColor('#0F172A').fontSize(24).font('Helvetica-Bold').text('INVOICE', 0, 50, { align: 'right', width: 545 });
        doc.fillColor('#64748B').fontSize(10).font('Helvetica');
        doc.text(`Invoice #: INV-${order.id.slice(0, 8).toUpperCase()}`, 0, 80, { align: 'right', width: 545 });
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 0, 95, { align: 'right', width: 545 });
        doc.text(`Status: ${order.payment_status.toUpperCase()}`, 0, 110, { align: 'right', width: 545 });
        
        if (order.razorpay_payment_id) {
            doc.text(`Payment ID: ${order.razorpay_payment_id}`, 0, 125, { align: 'right', width: 545 });
        }

        // Horizontal Line
        doc.moveTo(50, 150).lineTo(545, 150).strokeColor('#E2E8F0').lineWidth(2).stroke();

        // 2. Billing & Shipping Section
        const topBill = 170;
        doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, topBill);
        doc.fillColor('#475569').fontSize(10).font('Helvetica');
        doc.text(order.profiles?.full_name || 'Customer', 50, topBill + 20);
        doc.text(order.profiles?.email || 'N/A', 50, topBill + 35);
        doc.text(order.billing_address || 'Address not provided', 50, topBill + 50, { width: 200 });

        doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text('Ship To:', 300, topBill);
        doc.fillColor('#475569').fontSize(10).font('Helvetica');
        doc.text(order.profiles?.full_name || 'Customer', 300, topBill + 20);
        doc.text(order.shipping_address || 'Address not provided', 300, topBill + 35, { width: 200 });

        // Horizontal Line
        doc.moveTo(50, 260).lineTo(545, 260).strokeColor('#E2E8F0').lineWidth(2).stroke();

        // 3. Table Header
        const tableTop = 280;
        doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold');
        doc.text('Item Description', 50, tableTop);
        doc.text('Qty', 350, tableTop, { width: 50, align: 'center' });
        doc.text('Unit Price', 400, tableTop, { width: 70, align: 'right' });
        doc.text('Total', 470, tableTop, { width: 75, align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#CBD5E1').lineWidth(1).stroke();

        // 4. Table Rows
        let currentHeight = tableTop + 25;
        doc.fillColor('#334155').font('Helvetica');

        order.order_items.forEach((item: any) => {
            // Prevent overflowing page, though unlikely for most orders
            if (currentHeight > 650) {
                doc.addPage();
                currentHeight = 50;
            }

            const itemName = item.product?.name || 'Industrial Asset';
            const qty = Number(item.quantity || 1);
            const price = Number(item.price_at_purchase || 0);
            const lineTotal = qty * price;

            doc.text(itemName, 50, currentHeight, { width: 290, lineBreak: false });
            doc.text(qty.toString(), 350, currentHeight, { width: 50, align: 'center' });
            doc.text(`₹${price.toLocaleString('en-IN')}`, 400, currentHeight, { width: 70, align: 'right' });
            doc.text(`₹${lineTotal.toLocaleString('en-IN')}`, 470, currentHeight, { width: 75, align: 'right' });

            currentHeight += 25;
        });

        // Horizontal Line (Bottom of table)
        doc.moveTo(50, currentHeight + 10).lineTo(545, currentHeight + 10).strokeColor('#E2E8F0').lineWidth(2).stroke();

        // 5. Total Calculations
        currentHeight += 30;
        const totalAmount = Number(order.total_amount || 0);
        const paidAmount = Number(order.paid_amount || totalAmount); // Fallback to full for old orders
        const balanceDue = Number(order.balance_due || 0);

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748B').text('Subtotal:', 350, currentHeight);
        doc.fillColor('#0F172A').text(`₹${totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 450, currentHeight, { width: 95, align: 'right' });

        currentHeight += 20;
        doc.fillColor('#64748B').text('Paid Amount:', 350, currentHeight);
        doc.fillColor('#10B981').text(`₹${paidAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 450, currentHeight, { width: 95, align: 'right' });

        if (balanceDue > 0) {
            currentHeight += 20;
            doc.fillColor('#EF4444').text('Balance Due:', 350, currentHeight);
            doc.fillColor('#EF4444').text(`₹${balanceDue.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 450, currentHeight, { width: 95, align: 'right' });
        }

        currentHeight += 30;
        // Final Total Block
        doc.rect(340, currentHeight - 10, 205, 35).fill('#F8FAFC');
        doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text('Total Amount:', 350, currentHeight);
        doc.text(`₹${totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 450, currentHeight, { width: 95, align: 'right' });

        // 6. Footer (Pinned to bottom of page 1)
        doc.fontSize(9).font('Helvetica').fillColor('#94A3B8');
        doc.text('Thank you for choosing GASCART for your industrial needs.', 50, 750, { align: 'center', width: 495 });
        doc.text('Terms & Conditions apply. This is an electronically generated invoice.', 50, 765, { align: 'center', width: 495 });

        // Finalize
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

        // Send Email Async
        const userId = data.user_id;
        supabase.from('profiles').select('email').eq('id', userId).single()
            .then(({ data: profile }) => {
                if (profile?.email) {
                    import('../services/email.service').then(({ sendShippingUpdate }) => {
                        sendShippingUpdate(profile.email, data.id, carrier, tracking_number)
                            .catch(err => console.error('Failed to send shipping email:', err));
                    });
                }
            });

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
