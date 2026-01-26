import PDFDocument from 'pdfkit';
import { supabase } from '../config/supabase';

export const generateInvoiceBuffer = async (orderId: string): Promise<{ buffer: Buffer, filename: string }> => {
    // Fetch order details
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

        // --- Brand & Header ---
        doc.fillColor('#444444').font('Helvetica-Bold').fontSize(20).text('GASCART', 50, 50);
        doc.font('Helvetica').fontSize(10).text('Industrial Ecommerce Solutions', 50, 75);
        doc.text('123 Industrial Ave, Tech City, 560001', 50, 90);
        doc.text('support@gascart.com | +1 234 567 890', 50, 105);

        doc.font('Helvetica-Bold').fontSize(20).text('INVOICE', 200, 50, { align: 'right' });
        doc.font('Helvetica').fontSize(10).fillColor('#444444');
        doc.text(`Invoice #: INV-${orderId.slice(-8).toUpperCase()}`, 200, 75, { align: 'right' });
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 200, 90, { align: 'right' });
        doc.text(`Status: ${order.payment_status.toUpperCase()}`, 200, 105, { align: 'right' });

        doc.moveTo(50, 130).lineTo(550, 130).strokeColor('#eeeeee').stroke();

        // --- Customer Information ---
        const customerInfoTop = 150;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Bill To:', 50, customerInfoTop);
        doc.fontSize(10).font('Helvetica').fillColor('#444444');
        doc.text(profile?.full_name || 'Customer', 50, customerInfoTop + 20);
        doc.text(profile?.email || '', 50, customerInfoTop + 35);

        const shippingAddr = typeof order.shipping_address === 'object' ? order.shipping_address : {};
        doc.text(shippingAddr.phone || '', 50, customerInfoTop + 50);

        doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Ship To:', 300, customerInfoTop);
        doc.fontSize(10).font('Helvetica').fillColor('#444444');
        doc.text(shippingAddr.full_name || 'Customer', 300, customerInfoTop + 20);
        doc.text(shippingAddr.address_line1 || '', 300, customerInfoTop + 35);
        doc.text(`${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.zip_code || ''}`, 300, customerInfoTop + 50);

        doc.moveTo(50, 220).lineTo(550, 220).strokeColor('#eeeeee').stroke();

        // --- Table Header ---
        const tableTop = 240;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text('Item Description', 50, tableTop);
        doc.text('Qty', 300, tableTop);
        doc.text('Unit Price', 380, tableTop);
        doc.text('Total', 480, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#cccccc').stroke();

        // --- Items ---
        let y = tableTop + 30;
        doc.font('Helvetica');
        order.order_items.forEach((item: any) => {
            const productName = item.product?.name || 'Product';
            doc.fontSize(10).fillColor('#444444').text(productName, 50, y, { width: 240 });
            doc.text(item.quantity.toString(), 300, y);
            doc.text(`$${item.price_at_purchase.toFixed(2)}`, 380, y);
            doc.text(`$${(item.quantity * item.price_at_purchase).toFixed(2)}`, 480, y);
            y += 20;

            doc.moveTo(50, y - 5).lineTo(550, y - 5).strokeColor('#f9f9f9').stroke();
        });

        // --- Summary ---
        y += 20;
        const summaryX = 350;
        doc.fontSize(10).font('Helvetica').fillColor('#333333').text('Subtotal:', summaryX, y);
        doc.text(`$${order.total_amount.toFixed(2)}`, 480, y, { align: 'right' });

        y += 20;
        doc.fontSize(12).font('Helvetica-Bold').text('Total Amount:', summaryX, y);
        doc.fontSize(12).fillColor('#2ecc71').text(`$${order.total_amount.toFixed(2)}`, 480, y, { align: 'right' });

        // --- Footer ---
        const footerTop = 700;
        doc.moveTo(50, footerTop).lineTo(550, footerTop).strokeColor('#eeeeee').stroke();
        doc.fontSize(10).font('Helvetica').fillColor('#888888').text('Thank you for choosing GASCART for your industrial needs.', 50, footerTop + 20, { align: 'center' });
        doc.text('Terms & Conditions apply. This is an electronically generated invoice.', 50, footerTop + 35, { align: 'center' });

        doc.end();
    });
};
