import PDFDocument from 'pdfkit';
import { supabase } from '../config/supabase';
import { Readable } from 'stream';

// Generate invoice as a buffer (used for compatibility)
export const generateInvoiceBuffer = async (orderId: string): Promise<{ buffer: Buffer, filename: string }> => {
    // Fetch order details (admin context - no user authorization needed)
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            order_items(*, product:products(name, price))
        `)
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        throw new Error(`Order ${orderId} not found`);
    }

    // Validate payment status
    if (order.payment_status !== 'paid') {
        throw new Error(`Invoice not available for order ${orderId} - payment not confirmed`);
    }

    // Note: invoice_generated_at is updated by the main controller, not here
    // This function is for bulk exports where we don't track individual generation times

    // Fetch profile manually
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', order.user_id)
        .single();

    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        const doc = new PDFDocument({ margin: 50 });

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve({
            buffer: Buffer.concat(chunks),
            filename: `invoice-${orderId.slice(-8)}.pdf`
        }));
        doc.on('error', reject);

        generateInvoicePDF(doc, order, profile);
        doc.end();
    });
};

// Generate invoice as a stream (memory-efficient for bulk exports)
export const generateInvoiceStream = async (orderId: string): Promise<{ stream: PDFKit.PDFDocument, filename: string }> => {
    // Fetch order details (admin context - no user authorization needed)
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            order_items(*, product:products(name, price))
        `)
        .eq('id', orderId)
        .single();

    if (orderError || !order) {
        throw new Error(`Order ${orderId} not found`);
    }

    // Validate payment status
    if (order.payment_status !== 'paid') {
        throw new Error(`Invoice not available for order ${orderId} - payment not confirmed`);
    }

    // Fetch profile manually
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', order.user_id)
        .single();

    const doc = new PDFDocument({ margin: 50 });
    generateInvoicePDF(doc, order, profile);

    // Return the document stream (don't end it yet, caller will end it)
    return {
        stream: doc,
        filename: `invoice-${orderId.slice(-8)}.pdf`
    };
};

// Shared PDF generation logic
function generateInvoicePDF(doc: PDFKit.PDFDocument, order: any, profile: any) {
    // --- Brand & Header ---
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(24).text('GASCART', 50, 50);
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b').text('INDUSTRIAL ECOMMERCE SOLUTIONS', 50, 80, { characterSpacing: 1.5 });
    
    doc.fontSize(9).font('Helvetica').fillColor('#334155');
    doc.text('No 52, Kelagina Onikeri, Melina Onikeri Post', 50, 100);
    doc.text('Sirsi, Uttara Kannada, Karnataka - 581412', 50, 112);
    doc.text('info@gascart.in | +91 9739903856', 50, 124);

    doc.font('Helvetica-Bold').fontSize(24).fillColor('#0f172a').text('INVOICE', 200, 50, { align: 'right' });
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#64748b');
    doc.text(`ID: INV-${order.id.slice(-8).toUpperCase()}`, 200, 80, { align: 'right' });
    doc.font('Helvetica').fillColor('#334155');
    doc.text(`DATE: ${new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`, 200, 95, { align: 'right' });
    doc.text(`STATUS: ${order.payment_status.toUpperCase()}`, 200, 110, { align: 'right' });
    if (order.razorpay_payment_id) {
        doc.fontSize(8).text(`PAYMENT ID: ${order.razorpay_payment_id}`, 200, 125, { align: 'right' });
    }

    doc.moveTo(50, 145).lineTo(550, 145).lineWidth(1).strokeColor('#f1f5f9').stroke();

    // --- Customer Information ---
    const customerInfoTop = 165;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('BILL TO', 50, customerInfoTop, { characterSpacing: 1 });
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(profile?.full_name || 'Customer', 50, customerInfoTop + 18);
    doc.fontSize(9).font('Helvetica').fillColor('#475569');
    doc.text(profile?.email || '', 50, customerInfoTop + 33);

    const shippingAddr = typeof order.shipping_address === 'object' ? order.shipping_address : {};
    if (shippingAddr.phone) doc.text(`Phone: ${shippingAddr.phone}`, 50, customerInfoTop + 46);

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('SHIP TO', 300, customerInfoTop, { characterSpacing: 1 });
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(shippingAddr.full_name || profile?.full_name || 'Customer', 300, customerInfoTop + 18);
    doc.fontSize(9).font('Helvetica').fillColor('#475569');
    doc.text(shippingAddr.address_line1 || '', 300, customerInfoTop + 33);
    doc.text(`${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.postal_code || shippingAddr.zip_code || ''}`, 300, customerInfoTop + 46);

    doc.moveTo(50, 235).lineTo(550, 235).lineWidth(1).strokeColor('#f1f5f9').stroke();

    // --- Table Header ---
    const tableTop = 255;
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748b').text('ITEM DESCRIPTION', 50, tableTop);
    doc.text('QTY', 320, tableTop, { width: 40, align: 'center' });
    doc.text('UNIT PRICE', 380, tableTop, { width: 80, align: 'right' });
    doc.text('TOTAL', 480, tableTop, { width: 70, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).lineWidth(2).strokeColor('#0f172a').stroke();

    // --- Items ---
    let y = tableTop + 30;
    doc.font('Helvetica');
    order.order_items.forEach((item: any) => {
        const productName = item.product?.name || 'Product';
        doc.fontSize(10).fillColor('#1e293b').font('Helvetica-Bold').text(productName, 50, y, { width: 260 });
        doc.font('Helvetica').fillColor('#475569').text(item.quantity.toString(), 320, y, { width: 40, align: 'center' });
        doc.text(`INR ${item.price_at_purchase.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 380, y, { width: 80, align: 'right' });
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`INR ${(item.quantity * item.price_at_purchase).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, y, { width: 70, align: 'right' });
        y += 25;

        doc.moveTo(50, y - 5).lineTo(550, y - 5).lineWidth(0.5).strokeColor('#f1f5f9').stroke();
    });

    // --- Summary ---
    y += 15;
    const summaryX = 350;
    doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Subtotal:', summaryX, y);
    doc.font('Helvetica-Bold').fillColor('#1e293b').text(`INR ${order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, y, { width: 70, align: 'right' });

    // Show payment information
    const paidAmount = order.paid_amount || 0;
    const balanceDue = order.balance_due || 0;

    if (paidAmount > 0) {
        y += 20;
        doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Paid Amount:', summaryX, y);
        doc.font('Helvetica-Bold').fillColor('#1e293b').text(`INR ${paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, y, { width: 70, align: 'right' });
    }

    if (balanceDue > 0) {
        y += 20;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#e11d48').text('Balance Due:', summaryX, y);
        doc.text(`INR ${balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, y, { width: 70, align: 'right' });
    }

    y += 30;
    doc.rect(summaryX - 10, y - 10, 210, 40).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text('TOTAL AMOUNT', summaryX, y);
    doc.text(`INR ${order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, y, { width: 70, align: 'right' });

    // --- Footer ---
    const footerTop = 750; // Pushed down further to stay at bottom
    doc.moveTo(50, footerTop).lineTo(550, footerTop).lineWidth(1).strokeColor('#f1f5f9').stroke();
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('THANK YOU FOR CHOOSING GASCART FOR YOUR INDUSTRIAL NEEDS.', 50, footerTop + 15, { align: 'center', characterSpacing: 1 });
    doc.text('Terms & Conditions apply. This is an electronically generated invoice.', 50, footerTop + 28, { align: 'center' });
    doc.font('Helvetica-Bold').text('GASCART.IN', 50, footerTop + 42, { align: 'center', characterSpacing: 2 });
}
