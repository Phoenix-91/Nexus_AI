import { createTransport } from 'nodemailer';

let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });
    }
    return transporter;
}

export const emailService = {
    async sendEmail(recipient, subject, body) {
        try {
            // Validate email address
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(recipient)) {
                throw new Error('Invalid email address');
            }

            // Convert newlines to HTML breaks for HTML version
            const htmlBody = body.replace(/\n/g, '<br>');

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipient,
                subject: subject,
                text: body,
                html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${htmlBody}</div>`
            };

            const transport = getTransporter();
            const info = await transport.sendMail(mailOptions);

            return {
                success: true,
                messageId: info.messageId,
                sentAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error('Failed to send email');
        }
    },

    async verifyConnection() {
        try {
            const transport = getTransporter();
            await transport.verify();
            return true;
        } catch (error) {
            console.error('Email service connection error:', error);
            return false;
        }
    }
};
