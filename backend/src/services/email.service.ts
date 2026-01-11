import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
    attachments?: {
        filename: string;
        content: Buffer;
    }[];
}

export const sendEmail = async (options: EmailOptions) => {
    // If SMTP is not configured, we log and skip to avoid crashing in dev
    if (!process.env.SMTP_USER) {
        console.warn('SMTP Not configured. Skipping email send.');
        console.log('--- EMAIL SIMULATION ---');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body: ${options.text}`);
        console.log('--- END SIMULATION ---');
        return;
    }

    try {
        await transporter.sendMail({
            from: `"GASCART RFQ Engine" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            ...options,
        });
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

export const notifyAdminOfRFQ = async (rfqData: any, pdfBuffer?: Buffer) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gascart.com';

    await sendEmail({
        to: adminEmail,
        subject: `New Technical RFQ: ${rfqData.products.name}`,
        text: `A new technical enquiry has been received for ${rfqData.products.name} from ${rfqData.profiles.email}. 
        Check the admin dashboard or refer to the attached PDF for technical specs.`,
        attachments: pdfBuffer ? [{
            filename: `RFQ_${rfqData.id}.pdf`,
            content: pdfBuffer
        }] : []
    });
};
