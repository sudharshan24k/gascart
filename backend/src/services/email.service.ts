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

export const sendOrderConfirmation = async (email: string, orderId: string, amount: number, attachments?: any[]) => {
    const orderNumber = orderId.slice(-8).toUpperCase();
    await sendEmail({
        to: email,
        subject: `Order Confirmed: #${orderNumber} - GASCART`,
        text: `Thank you for your order! 
        
Order ID: #${orderNumber}
Total Amount: INR ${amount.toLocaleString('en-IN')}

We have received your order confirmation. Our team is now processing your technical requirements and coordinating with the respective vendors.

You can track your order status in your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-tracking/${orderId}

Best regards,
GasCart Operations Team`,
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; rounded: 12px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="color: #0f172a; margin: 0; font-size: 28px; letter-spacing: -0.025em;">GASCART</h1>
                    <p style="color: #64748b; font-size: 12px; font-weight: bold; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em;">Industrial Ecommerce Solutions</p>
                </div>

                <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 16px;">Order Confirmed!</h2>
                <p>Hello,</p>
                <p>Thank you for choosing GASCART. Your procurement request has been successfully registered and is now under processing.</p>
                
                <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin: 32px 0; border: 1px solid #e2e8f0;">
                    <div style="margin-bottom: 12px;">
                        <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Order Reference</span>
                        <div style="color: #0f172a; font-weight: bold; font-size: 16px;">#${orderNumber}</div>
                    </div>
                    <div>
                        <span style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Amount Processed</span>
                        <div style="color: #0f172a; font-weight: bold; font-size: 16px;">INR ${amount.toLocaleString('en-IN')}</div>
                    </div>
                </div>

                <p>Our operation team will now begin coordination for logistics and technical validation. You will receive further updates as the assets are prepared for shipment.</p>
                
                <div style="margin: 40px 0; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-tracking/${orderId}" 
                       style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
                        Track Order Status
                    </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 40px 0;" />
                
                <p style="color: #64748b; font-size: 12px; text-align: center;">
                    This is an automated confirmation. For technical support, please contact our helpline at +91 9739903856 or reply to info@gascart.in
                </p>
            </div>
        `,
        attachments
    });
};

export const sendShippingUpdate = async (email: string, orderId: string, carrier: string, trackingNumber: string) => {
    await sendEmail({
        to: email,
        subject: `Your Order #${orderId.slice(0, 8).toUpperCase()} has Shipped!`,
        text: `Good news! Your order has been shipped.

        Order ID: ${orderId.toUpperCase()}
        Carrier: ${carrier}
        Tracking Number: ${trackingNumber}

        Track here: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-tracking/${orderId}

        Best regards,
        Gascart Team`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #1a1a1a;">Your Order is on the way!</h2>
                <p>Good news! Your items have been shipped.</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Order ID:</strong> #${orderId.toUpperCase()}</p>
                    <p><strong>Carrier:</strong> ${carrier}</p>
                    <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                </div>
                <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-tracking/${orderId}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Order</a></p>
            </div>
        `
    });
};
