const { Resend } = require('resend');

class EmailProvider {
    constructor() {
        this.resend = null;
        if (!process.env.RESEND_API_KEY) {
            console.error('[EmailProvider] CRITICAL: RESEND_API_KEY is not set. All emails will be dropped!');
        } else {
            this.resend = new Resend(process.env.RESEND_API_KEY);
        }
        // Default from address — can be overridden per email
        this.defaultFrom = process.env.EMAIL_FROM || 'Next App <noreply@corteconexao.com.br>';
    }

    async sendEmail(to, subject, html) {
        if (!process.env.RESEND_API_KEY) {
            console.warn('[EmailProvider] ❌ RESEND_API_KEY not set. Skipping email to:', to);
            return false;
        }

        try {
            console.log(`[EmailProvider] 📧 Sending via Resend to: ${to}`);
            const { data, error } = await this.resend.emails.send({
                from: this.defaultFrom,
                to,
                subject,
                html
            });

            if (error) {
                console.error('[EmailProvider] ❌ Resend API error details:', JSON.stringify(error, null, 2));
                return false;
            }

            console.log(`[EmailProvider] ✅ Email sent successfully to ${to}. ID: ${data?.id}`);
            return true;
        } catch (error) {
            console.error('[EmailProvider] ❌ Exception sending email to', to, ':', error.message);
            return false;
        }
    }
}

const emailProvider = new EmailProvider();
module.exports = emailProvider;
