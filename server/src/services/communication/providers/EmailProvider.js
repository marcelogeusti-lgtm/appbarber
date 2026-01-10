const nodemailer = require('nodemailer');

class EmailProvider {
    constructor() {
        // Configure using environment variables
        // If variables strictly not set, it might fail silently or log error
        // For production, suggest user to provide SMTP
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Or customizable
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendEmail(to, subject, html) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email credentials not set. Skipping email.');
            return false;
        }

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                html
            });
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}

const emailProvider = new EmailProvider();
module.exports = emailProvider;
