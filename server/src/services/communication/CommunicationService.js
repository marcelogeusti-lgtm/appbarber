const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const whatsappService = require('./WhatsAppService');
const emailProvider = require('./providers/EmailProvider');

class CommunicationService {


    async getTemplate(type, barbershopId) {
        // Try to find specific override
        const specific = await prisma.notificationTemplate.findFirst({
            where: { type, barbershopId }
        });
        if (specific) return specific;

        // Fallback to global
        return await prisma.notificationTemplate.findFirst({
            where: { type, barbershopId: null }
        });
    }

    // Send Confirmation Request
    async sendConfirmationRequest(appointment) {
        const { client, service, date, barbershop, professional } = appointment;
        const formattedDate = new Date(date).toLocaleString('pt-BR');

        // Fetch Template
        const template = await this.getTemplate('CONFIRMATION_REQUEST', barbershop.id);

        let messageContent = template
            ? template.content
            : `Olá, ${client.name}! ✂️\n\nSeu agendamento na *${barbershop.name}* está quase confirmado.\n\n📅 Data: *${formattedDate}*\n💇‍♂️ Serviço: *${service.name}*\n💈 Profissional: *${professional.name}*\n\nResponda *1* para confirmar ou *2* para cancelar.`;

        // Ensure template active
        if (template && !template.active) {
            console.log(`Template CONFIRMATION_REQUEST inactive for barbershop ${barbershop.id}`);
            return;
        }

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
            try {
                await whatsappService.sendText(client.phone, messageContent);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'CONFIRMATION_REQUEST', messageContent, 'SENT');
            } catch (error) {
                console.error('Failed to send WA:', error);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'CONFIRMATION_REQUEST', messageContent, 'FAILED');
            }
        }

        // 2. Email (Optional, if email exists)
        if (client.email) {
            // Logic for email sending...
            // await emailProvider.sendEmail(...)
        }
    }

    // Send Appointment Reminder
    async sendAppointmentReminder(appointment) {
        const { client, service, date, barbershop, professional } = appointment;
        const formattedDate = new Date(date).toLocaleString('pt-BR');

        // Fetch Template
        const template = await this.getTemplate('REMINDER', barbershop.id);

        let messageContent = template
            ? template.content
            : `Olá, ${client.name}! 🔔\n\nLembramos do seu agendamento na *${barbershop.name}*.\n\n📅 Data: *${formattedDate}*\n💇‍♂️ Serviço: *${service.name}*\n💈 Profissional: *${professional.name}*\n\nEstamos te esperando!`;

        // Ensure template active
        if (template && !template.active) {
            console.log(`Template REMINDER inactive for barbershop ${barbershop.id}`);
            return;
        }

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
            try {
                await whatsappService.sendText(client.phone, messageContent);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'REMINDER', messageContent, 'SENT');
            } catch (error) {
                console.error('Failed to send WA Reminder:', error);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'REMINDER', messageContent, 'FAILED');
            }
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

    // --- Handling Incoming Messages (Strict Rule) ---
    async handleIncomingMessage(data) {
        const { from, text, name } = data;
        const phone = from.replace('@s.whatsapp.net', '');

        // 1. Strict Filter: Register Client Only
        // Search user by phone (try exact or without 55 if needed, standardizing on DB)
        // Assuming DB stores with 55 or distinct. 
        // Better: Search endswith to be safe or exact match if standardized.

        const client = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: phone },
                    { phone: `+${phone}` }, // if stored with +
                    { phone: phone.replace('55', '') } // backup check
                ]
            }
        });

        if (!client) {
            console.log(`[WA Strict] Ignored message from unregistered number: ${phone}`);
            return;
        }

        console.log(`[WA Strict] Valid message from client ${client.name} (${client.id})`);

        // 2. Create Log / Conversation Context
        // Find active appointment to bind context (Prioritize today or future)
        const activeAppointment = await prisma.appointment.findFirst({
            where: {
                clientId: client.id,
                status: { in: ['PENDING', 'CONFIRMED', 'SCHEDULED'] },
                date: { gte: new Date() } // Future
            },
            orderBy: { date: 'asc' }
        });

        // Log Inbound
        await this.log({
            clientId: client.id,
            id: activeAppointment?.id,
            barbershopId: activeAppointment?.barbershopId // Or derive from client owner/last interaction? 
            // If checking strict context, message must belong to a barbershop context. 
            // If client has NO appointment, maybe he is just asking info?
            // If we enforce appointment context, we might lose general inquiries.
            // User requested: "Conversas não relacionadas a clientes... bloqueadas". 
            // "Cada conversa deve estar OBRIGATORIAMENTE vinculada a um contexto... Agendamento (opcional, mas prioritário)".
            // So if no appointment, we bind to Client-Barbershop general context (if client is linked to shop).
        }, 'WHATSAPP', 'INBOUND', 'REPLY', text, 'READ');

        // TODO: Emit to frontend CRM if needed
    }
}


module.exports = new CommunicationService();
