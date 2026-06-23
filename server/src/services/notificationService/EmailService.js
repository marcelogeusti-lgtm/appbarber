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
            let templatePath;
            switch (templateName) {
                case 'auth-otp':
                    templatePath = path.join(this.templatesPath, 'auth-otp.html');
                    break;
                case 'appointment-cancelled':
                    templatePath = path.join(this.templatesPath, 'appointment-cancelled.html');
                    break;
                case 'appointment-confirmation':
                    templatePath = path.join(this.templatesPath, 'appointment-confirmation.html');
                    break;
                case 'appointment-reminder':
                    templatePath = path.join(this.templatesPath, 'appointment-reminder.html');
                    break;
                case 'invoice-created':
                    templatePath = path.join(this.templatesPath, 'invoice-created.html');
                    break;
                case 'password-reset':
                    templatePath = path.join(this.templatesPath, 'password-reset.html');
                    break;
                case 'payment-confirmed':
                    templatePath = path.join(this.templatesPath, 'payment-confirmed.html');
                    break;
                default:
                    throw new Error(`Template ${templateName} not found`);
            }
            let htmlString;
            try {
                htmlString = fs.readFileSync(templatePath, 'utf-8');
            } catch (fsError) {
                console.warn(`[EmailService] Could not read template file for ${templateName}, using fallback. Error:`, fsError.message);
                if (templateName === 'auth-otp') {
                    htmlString = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Seu Código de Verificação</h2>
                        <p>O seu código de acesso ao Next App é: <strong>{{otp}}</strong></p>
                        <p>Este código é válido por 10 minutos.</p>
                        <img src="{{logoUrl}}" alt="Logo" style="max-height: 50px;" />
                    </div>`;
                } else {
                    htmlString = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Notificação - Next App</h2>
                        <p>Houve uma atualização em sua conta.</p>
                        <img src="{{logoUrl}}" alt="Logo" style="max-height: 50px;" />
                    </div>`;
                }
            }

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

            // Tabela unificada MessageLog
            await prisma.messageLog.create({
                data: {
                    type: 'EMAIL',
                    recipient: to,
                    body: `Subject: ${subject} | Template: ${template}`,
                    status: success ? 'SENT' : 'FAILED',
                    error: success ? null : 'emailProvider returns false or thrown.',
                    barbershopId: data && data.barbershopId ? data.barbershopId : null
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

            // Tabela unificada MessageLog
            await prisma.messageLog.create({
                data: {
                    type: 'EMAIL',
                    recipient: to,
                    body: `Subject: ${subject} | Template: ${template}`,
                    status: 'FAILED',
                    error: error.message,
                    barbershopId: data && data.barbershopId ? data.barbershopId : null
                }
            });

            return false;
        }
    }
}

module.exports = new EmailService();
