import PDFDocument from 'pdfkit';
import { supabase } from '../config/supabase';
import { renderInvoice, InvoiceData } from '../services/pdf.service';

// Generate invoice as a buffer (used for compatibility)
export const generateInvoiceBuffer = async (orderId: string): Promise<{ buffer: Buffer, filename: string }> => {
    // Fetch order details
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            order_items(*, product:products(name, price, advance_payment_percentage))
        `)
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        throw new Error(`Order ${orderId} not found`);
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', order.user_id)
        .single();

    const invoiceData: InvoiceData = {
        orderId: order.id,
        createdAt: order.created_at,
        paymentStatus: order.payment_status,
        razorpayPaymentId: order.razorpay_payment_id,
        totalAmount: order.total_amount,
        paidAmount: order.paid_amount,
        balanceDue: order.balance_due,
        orderItems: order.order_items,
        shippingAddress: order.shipping_address,
        profile: profile || undefined
    };

    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        const doc = new PDFDocument({ margin: 50 });

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve({
            buffer: Buffer.concat(chunks),
            filename: `invoice-${orderId.slice(-8)}.pdf`
        }));
        doc.on('error', reject);

        renderInvoice(doc, invoiceData);
        doc.end();
    });
};

// Generate invoice as a stream (memory-efficient for bulk exports)
export const generateInvoiceStream = async (orderId: string): Promise<{ stream: PDFKit.PDFDocument, filename: string }> => {
    // Fetch order details
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            order_items(*, product:products(name, price, advance_payment_percentage))
        `)
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        throw new Error(`Order ${orderId} not found`);
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', order.user_id)
        .single();

    const invoiceData: InvoiceData = {
        orderId: order.id,
        createdAt: order.created_at,
        paymentStatus: order.payment_status,
        razorpayPaymentId: order.razorpay_payment_id,
        totalAmount: order.total_amount,
        paidAmount: order.paid_amount,
        balanceDue: order.balance_due,
        orderItems: order.order_items,
        shippingAddress: order.shipping_address,
        profile: profile || undefined
    };

    const doc = new PDFDocument({ margin: 50 });
    renderInvoice(doc, invoiceData);

    return {
        stream: doc,
        filename: `invoice-${orderId.slice(-8)}.pdf`
    };
};
