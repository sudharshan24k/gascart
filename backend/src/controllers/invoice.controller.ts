import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generateInvoicePDF, InvoiceShippingAddress } from '../services/pdf.service';

export const generateInvoice = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // ── Fetch order ───────────────────────────────────────────────────────
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
                *,
                order_items(*, product:products(name, price))
            `)
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // ── Authorization ─────────────────────────────────────────────────────
        const isAdmin = userRole === 'admin' || req.user?.is_dev;
        if (!isAdmin && order.user_id !== userId) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You do not have permission to access this payment receipt',
            });
        }

        // ── Payment status guard ──────────────────────────────────────────────
        if (order.payment_status !== 'paid') {
            return res.status(400).json({
                error: 'Payment Receipt not available yet',
                message: 'Payment receipt will be available once payment is confirmed',
            });
        }

        // ── Return cached invoice if already generated ────────────────────────
        if (order.invoice_url) {
            return res.redirect(order.invoice_url);
        }

        // ── Fetch customer profile ────────────────────────────────────────────
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', order.user_id)
            .single();

        // ── Generate PDF ──────────────────────────────────────────────────────
        const shippingAddress: InvoiceShippingAddress =
            typeof order.shipping_address === 'object' ? order.shipping_address : {};

        const pdfBuffer = await generateInvoicePDF({
            orderId,
            createdAt: order.created_at,
            paymentStatus: order.payment_status,
            razorpayPaymentId: order.razorpay_payment_id,
            totalAmount: order.total_amount,
            paidAmount: order.paid_amount ?? 0,
            balanceDue: order.balance_due ?? 0,
            orderItems: order.order_items,
            shippingAddress,
            profile: profile ?? undefined,
        });

        // ── Upload to Supabase Storage ────────────────────────────────────────
        const filename = `payment-receipt-${orderId.slice(-8)}.pdf`;
        const storagePath = `invoices/${filename}`;

        const { error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(storagePath, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            // Fallback: stream the buffer directly to the client
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            return res.send(pdfBuffer);
        }

        // ── Get public URL & persist on order ─────────────────────────────────
        const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(storagePath);

        await supabase
            .from('orders')
            .update({
                invoice_url: publicUrl,
                invoice_generated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        return res.redirect(publicUrl);

    } catch (error: any) {
        console.error('Invoice generation error:', error);
        return res.status(500).json({ error: error.message });
    }
};
