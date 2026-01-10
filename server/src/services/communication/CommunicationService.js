const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const whatsAppProvider = require('./providers/WhatsAppProvider');
const emailProvider = require('./providers/EmailProvider');

class CommunicationService {


    // Send Confirmation Request
    async sendConfirmationRequest(appointment) {
        const { client, service, date, barbershop, professional } = appointment;
        const formattedDate = new Date(date).toLocaleString('pt-BR');

        // Fetch Template
        const template = await prisma.notificationTemplate.findUnique({
            where: { type: 'CONFIRMATION_REQUEST' }
        });

        let messageContent = template
            ? template.content
            : `Olá, ${client.name}! ✂️\n\nSeu agendamento na *${barbershop.name}* está quase confirmado.\n\n📅 Data: *${formattedDate}*\n💇‍♂️ Serviço: *${service.name}*\n💈 Profissional: *${professional.name}*\n\nResponda *1* para confirmar ou *2* para cancelar.`;

        // Replace Variables
        messageContent = messageContent
            .replace('{{clientName}}', client.name)
            .replace('{{barbershopName}}', barbershop.name)
            .replace('{{date}}', new Date(date).toLocaleDateString('pt-BR'))
            .replace('{{time}}', new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
            .replace('{{serviceName}}', service.name)
            .replace('{{professionalName}}', professional.name);

        // 1. WhatsApp
        if (client.phone) {
            // Remove non-digits
            const phone = client.phone.replace(/\D/g, '');
            // Simple validation (must be 55 + DDD + Num)
            const targetPhone = phone.startsWith('55') ? phone : `55${phone}`;

            // Check connection first
            if (whatsAppProvider.status !== 'CONNECTED') {
                console.log('WhatsApp disconnected, skipping confirmation request.');
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'CONFIRMATION_REQUEST', messageContent, 'SKIPPED');
            } else {
                try {
                    await whatsAppProvider.sendText(targetPhone, messageContent);
                    await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'CONFIRMATION_REQUEST', messageContent, 'SENT');
                } catch (error) {
                    console.error('Failed to send WA:', error);
                    await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'CONFIRMATION_REQUEST', messageContent, 'FAILED');
                }
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
