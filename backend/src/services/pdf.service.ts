import PDFDocument from 'pdfkit';
import { Stream } from 'stream';

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
