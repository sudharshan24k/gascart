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

export const sendOrderConfirmation = async (email: string, orderId: string, amount: number) => {
    await sendEmail({
        to: email,
        subject: `Order Confirmation - #${orderId.slice(0, 8).toUpperCase()}`,
        text: `Thank you for your order! 
        
        Order ID: ${orderId.toUpperCase()}
        Total Amount: $${amount.toFixed(2)}
        
        We have received your order and it is being processed. You can track your order status in your profile.
        
        Best regards,
        Gascart Team`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #1a1a1a;">Order Confirmed!</h2>
                <p>Thank you for your purchase. We're getting it ready.</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Order ID:</strong> #${orderId.toUpperCase()}</p>
                    <p><strong>Total Amount:</strong> $${amount.toFixed(2)}</p>
                </div>
                <p>You can track your order status in your <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-tracking/${orderId}">Dashboard</a>.</p>
            </div>
        `
    });
};
