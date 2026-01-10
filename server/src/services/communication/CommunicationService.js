const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const whatsAppProvider = require('./providers/WhatsAppProvider');
const emailProvider = require('./providers/EmailProvider');

class CommunicationService {

    // Send Confirmation Request
    async sendConfirmationRequest(appointment) {
        const { client, service, date, barbershop, professional } = appointment;
        const formattedDate = new Date(date).toLocaleString('pt-BR');

        // 1. WhatsApp
        if (client.phone) {
            // Remove non-digits
            const phone = client.phone.replace(/\D/g, '');
            // Simple validation (must be 55 + DDD + Num)
            const targetPhone = phone.startsWith('55') ? phone : `55${phone}`;

            const message = `Olá, ${client.name}! ✂️\n\nSeu agendamento na *${barbershop.name}* está quase confirmado.\n\n📅 Data: *${formattedDate}*\n💇‍♂️ Serviço: *${service.name}*\n💈 Profissional: *${professional.name}*\n\nResponda *1* para confirmar ou *2* para cancelar.`;

            try {
                await whatsAppProvider.sendText(targetPhone, message);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'CONFIRMATION_REQUEST', message, 'SENT');
            } catch (error) {
                console.error('Failed to send WA:', error);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'CONFIRMATION_REQUEST', message, 'FAILED');
            }
        }

        // 2. Email (Optional, if email exists)
        if (client.email) {
            // Logic for email sending...
            // await emailProvider.sendEmail(...)
        }
    }

    async log(appointment, channel, direction, type, content, status) {
        try {
            await prisma.communicationLog.create({
                data: {
                    channel,
                    direction,
                    type,
                    content,
                    status,
                    clientId: appointment.clientId,
                    appointmentId: appointment.id,
                    barbershopId: appointment.barbershopId
                }
            });
        } catch (error) {
            console.error('Error logging communication:', error);
        }
    }

    // Expose status for Frontend Admin
    async getConnectionStatus() {
        return whatsAppProvider.getStatus();
    }
}

module.exports = new CommunicationService();
