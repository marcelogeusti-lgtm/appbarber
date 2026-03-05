const fs = require('fs');
const path = require('path');
const emailProvider = require('../communication/providers/EmailProvider');
const prisma = require('../../lib/prisma');

class EmailService {
    constructor() {
        this.templatesPath = path.join(__dirname, '../../email-templates');
    }

    /**
     * Carrega um template HTML e injeta os dados (substitui os placeholders {{chave}})
     */
    async loadTemplate(templateName, data) {
        try {
            const templatePath = path.join(this.templatesPath, `${templateName}.html`);
            let htmlString = fs.readFileSync(templatePath, 'utf-8');

            // Substitui todas as ocorrências de {{chave}} pelo valor em data
            for (const key in data) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                // Lida com null/undefined fallback pra string vazia
                htmlString = htmlString.replace(regex, data[key] || '');
            }

            return htmlString;
        } catch (error) {
            console.error(`[EmailService] Failed to load template ${templateName}:`, error);
            throw new Error('Template loading failed');
        }
    }

    /**
     * Envia o email usando o provider base e persiste um EmailLog no banco
     */
    async sendTemplateEmail({ to, subject, template, data, userId = null }) {
        try {
            console.log(`[EmailService] Sending email to ${to} using template: ${template}`);
            const htmlContent = await this.loadTemplate(template, data);

            // Log de início PENDING
            let logRecord = await prisma.emailLog.create({
                data: {
                    userId,
                    email: to,
                    subject,
                    provider: 'DEFAULT', // Futuro: SMTP customizado do barbeiro
                    status: 'PENDING'
                }
            });

            // Chama o provedor basico central (Nodemailer config atual)
            const success = await emailProvider.sendEmail(to, subject, htmlContent);

            // Atualiza status do log
            await prisma.emailLog.update({
                where: { id: logRecord.id },
                data: {
                    status: success ? 'SENT' : 'FAILED',
                    errorMessage: success ? null : 'emailProvider returns false or thrown.'
                }
            });

            if (!success) {
                console.error(`[EmailService] Failed to send email to ${to}`);
            }

            return success;
        } catch (error) {
            console.error(`[EmailService] Exception while sending email:`, error);

            // Log do Erro Severo Base
            await prisma.emailLog.create({
                data: {
                    userId,
                    email: to,
                    subject,
                    provider: 'DEFAULT',
                    status: 'FAILED',
                    errorMessage: error.message
                }
            });

            return false;
        }
    }
}

module.exports = new EmailService();
