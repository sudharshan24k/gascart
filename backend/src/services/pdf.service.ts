import PDFDocument from 'pdfkit';

// ─── RFQ PDF ─────────────────────────────────────────────────────────────────

export interface RFQDocumentData {
    rfqId: string;
    productName: string;
    submittedFields: Record<string, any>;
    userEmail: string;
    createdAt: string;
}

export const generateRFQPDF = async (data: RFQDocumentData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('GASCART - Technical Enquiry', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Enquiry ID: ${data.rfqId}`, { align: 'right' });
        doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        // Product Info
        doc.fontSize(14).text('Industrial Asset Details', { underline: true });
        doc.fontSize(12).text(`Asset Name: ${data.productName}`);
        doc.moveDown();

        // Customer Info
        doc.fontSize(14).text('Client Information', { underline: true });
        doc.fontSize(12).text(`Email: ${data.userEmail}`);
        doc.moveDown();

        // Technical Specifications
        doc.fontSize(14).text('Technical Requirements', { underline: true });
        doc.moveDown(0.5);

        Object.entries(data.submittedFields).forEach(([label, value]) => {
            doc.fontSize(10).font('Helvetica-Bold').text(`${label}: `, { continued: true });
            doc.font('Helvetica').text(`${value}`);
            doc.moveDown(0.5);
        });

        // Footer
        const bottom = doc.page.height - 100;
        doc.fontSize(8).text(
            'This is a system-generated technical requisition document. Confidentiality of engineering parameters is maintained under standard GASCART NDA terms.',
            50,
            bottom,
            { align: 'center', width: 500 }
        );

        doc.end();
    });
};

// ─── Invoice PDF ──────────────────────────────────────────────────────────────

export interface InvoiceOrderItem {
    quantity: number;
    price_at_purchase: number;
    product?: { name?: string };
}

export interface InvoiceShippingAddress {
    full_name?: string;
    address_line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    zip_code?: string;
    phone?: string;
}

export interface InvoiceData {
    orderId: string;
    createdAt: string;
    paymentStatus: string;
    razorpayPaymentId?: string;
    totalAmount: number;
    paidAmount?: number;
    balanceDue?: number;
    orderItems: InvoiceOrderItem[];
    shippingAddress: InvoiceShippingAddress;
    profile?: { full_name?: string; email?: string };
}

export const generateInvoicePDF = (data: InvoiceData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const shortId = data.orderId.slice(-8).toUpperCase();

        // ── Brand & Header ────────────────────────────────────────────────────
        doc.fillColor('#444444').font('Helvetica-Bold').fontSize(20).text('GASCART', 50, 50);
        doc.font('Helvetica').fontSize(10).text('Industrial Ecommerce Solutions', 50, 75);
        doc.text('123 Industrial Ave, Tech City, 560001', 50, 90);
        doc.text('support@gascart.com | +91 234 567 890', 50, 105);

        doc.font('Helvetica-Bold').fontSize(20).text('INVOICE', 200, 50, { align: 'right' });
        doc.font('Helvetica').fontSize(10).fillColor('#444444');
        doc.text(`Invoice #: INV-${shortId}`, 200, 75, { align: 'right' });
        doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, 200, 90, { align: 'right' });
        doc.text(`Status: ${data.paymentStatus.toUpperCase()}`, 200, 105, { align: 'right' });

        if (data.razorpayPaymentId) {
            doc.text(`Payment ID: ${data.razorpayPaymentId}`, 200, 120, { align: 'right' });
        }

        doc.moveTo(50, 145).lineTo(550, 145).strokeColor('#eeeeee').stroke();

        // ── Customer / Shipping Info ──────────────────────────────────────────
        const customerInfoTop = 165;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Bill To:', 50, customerInfoTop);
        doc.fontSize(10).font('Helvetica').fillColor('#444444');
        doc.text(data.profile?.full_name || 'Customer', 50, customerInfoTop + 20);
        doc.text(data.profile?.email || '', 50, customerInfoTop + 35);
        doc.text(data.shippingAddress.phone || '', 50, customerInfoTop + 50);

        doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Ship To:', 300, customerInfoTop);
        doc.fontSize(10).font('Helvetica').fillColor('#444444');
        doc.text(data.shippingAddress.full_name || 'Customer', 300, customerInfoTop + 20);
        doc.text(data.shippingAddress.address_line1 || '', 300, customerInfoTop + 35);
        doc.text(
            `${data.shippingAddress.city || ''}, ${data.shippingAddress.state || ''} ${data.shippingAddress.postal_code || data.shippingAddress.zip_code || ''}`,
            300,
            customerInfoTop + 50
        );

        doc.moveTo(50, 235).lineTo(550, 235).strokeColor('#eeeeee').stroke();

        // ── Items Table ───────────────────────────────────────────────────────
        const tableTop = 255;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text('Item Description', 50, tableTop);
        doc.text('Qty', 300, tableTop);
        doc.text('Unit Price', 380, tableTop);
        doc.text('Total', 480, tableTop);
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#cccccc').stroke();

        let y = tableTop + 30;
        doc.font('Helvetica');
        data.orderItems.forEach((item) => {
            const name = item.product?.name || 'Product';
            doc.fontSize(10).fillColor('#444444').text(name, 50, y, { width: 240 });
            doc.text(item.quantity.toString(), 300, y);
            doc.text(`₹${item.price_at_purchase.toFixed(2)}`, 380, y);
            doc.text(`₹${(item.quantity * item.price_at_purchase).toFixed(2)}`, 480, y);
            y += 20;
            doc.moveTo(50, y - 5).lineTo(550, y - 5).strokeColor('#f9f9f9').stroke();
        });

        // ── Summary ───────────────────────────────────────────────────────────
        y += 20;
        const summaryX = 350;

        doc.fontSize(10).font('Helvetica').fillColor('#333333').text('Subtotal:', summaryX, y);
        doc.text(`₹${data.totalAmount.toFixed(2)}`, 480, y, { align: 'right' });

        if (data.paidAmount && data.paidAmount > 0) {
            y += 20;
            doc.text('Paid Amount:', summaryX, y);
            doc.text(`₹${data.paidAmount.toFixed(2)}`, 480, y, { align: 'right' });
        }

        if (data.balanceDue && data.balanceDue > 0) {
            y += 20;
            doc.font('Helvetica-Bold').fillColor('#e74c3c').text('Balance Due:', summaryX, y);
            doc.fillColor('#e74c3c').text(`₹${data.balanceDue.toFixed(2)}`, 480, y, { align: 'right' });
        }

        y += 25;
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Total Amount:', summaryX, y);
        doc.fontSize(12).fillColor('#2ecc71').text(`₹${data.totalAmount.toFixed(2)}`, 480, y, { align: 'right' });

        // ── Footer ────────────────────────────────────────────────────────────
        const footerTop = 700;
        doc.moveTo(50, footerTop).lineTo(550, footerTop).strokeColor('#eeeeee').stroke();
        doc.fontSize(10).font('Helvetica').fillColor('#888888').text(
            'Thank you for choosing GASCART for your industrial needs.',
            50, footerTop + 20,
            { align: 'center' }
        );
        doc.text(
            'Terms & Conditions apply. This is an electronically generated invoice.',
            50, footerTop + 35,
            { align: 'center' }
        );

        doc.end();
    });
};
