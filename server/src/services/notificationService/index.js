const eventBus = require('../events/eventBus');
const whatsappService = require('../communication/WhatsAppService');
const internalNotifier = require('./internalNotifier');
const pushService = require('./PushNotificationService');
const emailService = require('./EmailService');
const prisma = require('../../lib/prisma');

console.log('[NotificationService] Initializing listeners...');

// Event: APPOINTMENT_CREATED
eventBus.on('APPOINTMENT_CREATED', async (payload) => {
    console.log(`[NotificationService] Event Received: APPOINTMENT_CREATED for ID ${payload.id}`);

    // Create central Notification Record
    try {
        await prisma.notification.create({
            data: {
                clientId: payload.client.id,
                userId: payload.professionalId, // Professional linked
                title: 'Agendamento Confirmado',
                message: `${payload.service.name} em ${new Date(payload.date).toLocaleDateString('pt-BR')} às ${new Date(payload.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
                type: 'appointment_created',
                appointmentId: payload.id
            }
        });
    } catch (e) { console.error('Error saving notification', e) }

    // 1. Internal Notification (Critical - should always fire)
    try {
        await internalNotifier.createAppointmentNotification(payload);

        // --- Push Notification (FCM) ---
        const professionalUser = await prisma.user.findUnique({
            where: { id: payload.professionalId },
            select: { authUserId: true }
        });

        if (professionalUser?.authUserId) {
            await pushService.sendToUser(professionalUser.authUserId, '📅 Novo Agendamento!', {
                body: `${payload.client.name} marcou ${payload.service.name} para ${new Date(payload.date).toLocaleDateString('pt-BR')} às ${new Date(payload.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
                url: '/dashboard/appointments'
            });
        }
    } catch (err) {
        console.error('[NotificationService] Internal/Push Notification Failed:', err);
    }

    // 2. WhatsApp Notification (Best Effort - fail safe)
    try {
        const dateObj = new Date(payload.date);
        await whatsappService.sendTemplate(payload.client.phone, 'CONFIRMATION', {
            clientName: payload.client.name,
            barbershopName: payload.barbershop.name,
            date: dateObj.toLocaleDateString('pt-BR'),
            time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            serviceName: payload.service.name
        });
    } catch (err) {
        console.error('[NotificationService] WhatsApp Notification Failed:', err);
    }

    // 3. Email Notification (Async)
    try {
        const clientEmail = payload.client?.authUser?.email || payload.client?.email;

        if (clientEmail) {
            const dateObj = new Date(payload.date);

            // Format Products HTML if any
            let productsHtml = '';
            if (payload.order && payload.order.items) {
                const products = payload.order.items.filter(i => i.type === 'PRODUCT');
                if (products.length > 0) {
                    productsHtml = '<div style="margin-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 10px;">';
                    productsHtml += '<p style="margin-bottom: 5px; color: #94a3b8; font-size: 14px;">Produtos Adicionais:</p>';
                    products.forEach(p => {
                        productsHtml += `<div class="detail-item"><span class="label">${p.product?.name || 'Produto'} (x${p.quantity})</span><span class="value">R$ ${Number(p.total).toFixed(2)}</span></div>`;
                    });
                    productsHtml += '</div>';
                }
            }

            emailService.sendTemplateEmail({
                to: clientEmail,
                subject: 'Confirmação de Agendamento - Next App',
                template: 'appointment-confirmation',
                userId: payload.clientId,
                data: {
                    clientName: payload.client.name,
                    barbershopName: payload.barbershop?.name || 'Nossa Barbearia',
                    serviceName: payload.service?.name || 'Serviço',
                    barberName: payload.professional?.name || 'Profissional',
                    date: dateObj.toLocaleDateString('pt-BR'),
                    time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    productsHtml: productsHtml,
                    totalPrice: Number(payload.order?.total || payload.service?.price || 0).toFixed(2),
                    logoUrl: `${process.env.FRONTEND_URL || 'https://appbarber.vercel.app'}/logos/logo_full.png`
                }
            });
            console.log(`[NotificationService] Appointment Confirmation Email sent to ${clientEmail}`);
        }
    } catch (err) {
        console.error('[NotificationService] Email Dispatch error:', err);
    }
});

// Event: APPOINTMENT_REMINDER
eventBus.on('APPOINTMENT_REMINDER', async (payload) => {
    console.log(`[NotificationService] Event Received: APPOINTMENT_REMINDER for ID ${payload.id}`);

    try {
        await prisma.notification.create({
            data: {
                clientId: payload.client.id,
                title: 'Lembrete de Horário',
                message: `Seu horário para ${payload.service.name} é hoje!`,
                type: 'appointment_reminder',
                appointmentId: payload.id
            }
        });
    } catch (e) { }

    try {
        await internalNotifier.createReminderNotification(payload);

        // --- Push Notification (FCM) to Client ---
        if (payload.client?.authUserId) {
            await pushService.sendToUser(payload.client.authUserId, '⏰ Lembrete de Agendamento', {
                body: `Seu horário para ${payload.service.name} na ${payload.barbershop.name} é em 1 hora (${new Date(payload.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}).`,
                url: '/appointments'
            });
        }
    } catch (err) {
        console.error('[NotificationService] Internal Reminder Failed:', err);
    }

    try {
        const dateObj = new Date(payload.date);
        await whatsappService.sendTemplate(payload.client.phone, 'REMINDER', {
            clientName: payload.client.name,
            barbershopName: payload.barbershop.name,
            time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
    } catch (err) {
        console.error('[NotificationService] WhatsApp Reminder Failed:', err);
    }

    // 3. Email Notification
    try {
        const clientWithEmail = await prisma.client.findUnique({
            where: { id: payload.client.id },
            include: { authUser: true }
        });

        if (clientWithEmail?.authUser?.email) {
            const dateObj = new Date(payload.date);
            emailService.sendTemplateEmail({
                to: clientWithEmail.authUser.email,
                subject: 'Lembrete do seu agendamento hoje!',
                template: 'appointment-reminder',
                userId: clientWithEmail.id,
                data: {
                    cliente: payload.client.name,
                    barbershop: payload.barbershop.name,
                    service: payload.service.name,
                    time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    address: payload.barbershop?.address || 'Endereço não informado',
                    logoUrl: `${process.env.FRONTEND_URL || 'https://appbarber.vercel.app'}/logos/logo_full.png`
                }
            });
        }
    } catch (err) { console.error('Email reminder error', err); }
});

// Event: APPOINTMENT_UPDATED (Cancellation, etc)
eventBus.on('APPOINTMENT_UPDATED', async ({ appointment, oldStatus }) => {
    if (appointment.status === 'CANCELLED') {

        try {
            await prisma.notification.create({
                data: {
                    clientId: appointment.clientId,
                    userId: appointment.professionalId,
                    title: 'Agendamento Cancelado',
                    message: `Cancelamento: ${appointment.service?.name} em ${new Date(appointment.date).toLocaleDateString('pt-BR')}`,
                    type: 'appointment_cancelled',
                    appointmentId: appointment.id
                }
            });
        } catch (e) { }

        // Notify the OTHER party
        // 1. Notify Professional (if cancelled by system/client)
        const professionalUser = await prisma.user.findUnique({
            where: { id: appointment.professionalId },
            select: { authUserId: true }
        });

        if (professionalUser?.authUserId) {
            await pushService.sendToUser(professionalUser.authUserId, '❌ Agendamento Cancelado', {
                body: `O agendamento de ${appointment.client?.name || 'Cliente'} para ${new Date(appointment.date).toLocaleDateString('pt-BR')} foi cancelado.`,
                url: '/dashboard/appointments'
            });
        }

        // 2. Notify Client (if cancelled by professional/system)
        if (appointment.client?.authUserId) {
            await pushService.sendToUser(appointment.client.authUserId, '❌ Agendamento Cancelado', {
                body: `Seu agendamento para ${appointment.service?.name} na ${appointment.barbershop?.name} foi cancelado.`,
                url: '/appointments'
            });

            // Dispatch Email async
            try {
                const clientWithEmail = await prisma.client.findUnique({
                    where: { id: appointment.clientId },
                    include: { authUser: true }
                });
                if (clientWithEmail?.authUser?.email) {
                    const dateObj = new Date(appointment.date);
                    emailService.sendTemplateEmail({
                        to: clientWithEmail.authUser.email,
                        subject: 'Agendamento Cancelado',
                        template: 'appointment-cancelled',
                        userId: clientWithEmail.id,
                        data: {
                            cliente: clientWithEmail.name,
                            barbershop: appointment.barbershop?.name || 'Barbearia',
                            service: appointment.service?.name || 'Serviço',
                            barber: appointment.professional?.name || 'Profissional',
                            date: dateObj.toLocaleDateString('pt-BR'),
                            time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                            logoUrl: `${process.env.FRONTEND_URL || 'https://appbarber.vercel.app'}/logos/logo_full.png`
                        }
                    });
                }
            } catch (e) { console.error('Error email emit cancel', e) }
        }
    }
});

// Event: PAYMENT_CONFIRMED
eventBus.on('PAYMENT_CONFIRMED', async (payload) => {
    console.log(`[NotificationService] Event Received: PAYMENT_CONFIRMED for Order ${payload.orderId || payload.id}`);
    try {
        await prisma.notification.create({
            data: {
                clientId: payload.clientId,
                title: 'Pagamento Confirmado',
                message: `Recebemos seu pagamento no valor de R$ ${payload.amount}`,
                type: 'payment_confirmed',
                orderId: payload.orderId || payload.id
            }
        });

        const clientData = await prisma.client.findUnique({
            where: { id: payload.clientId },
            include: { authUser: true }
        });

        if (clientData?.authUser?.email) {
            emailService.sendTemplateEmail({
                to: clientData.authUser.email,
                subject: 'Pagamento Confirmado',
                template: 'payment-confirmed',
                userId: clientData.id,
                data: {
                    amount: payload.amount.toString(),
                    description: payload.description || 'Sua fatura do AppBarber',
                    paymentMethod: payload.paymentMethod || 'Sistema de Pagamento',
                    transactionId: payload.transactionId || payload.id || 'N/A',
                    date: new Date().toLocaleDateString('pt-BR'),
                    logoUrl: `${process.env.FRONTEND_URL || 'https://appbarber.vercel.app'}/logos/logo_full.png`
                }
            });
        }
    } catch (err) {
        console.error('[NotificationService] Payment notification error:', err);
    }
});

// Event: INVOICE_CREATED
eventBus.on('INVOICE_CREATED', async (payload) => {
    // payload ex: { barbershopUserEmail, dueDate, amount, description, paymentLink, invoiceId, barbershopName, userId }
    try {
        await prisma.notification.create({
            data: {
                userId: payload.userId,
                title: 'Nova Fatura Gerada',
                message: `Fatura AppBarber gerada p/ vencimento ${payload.dueDate}`,
                type: 'invoice_created'
            }
        });

        if (payload.barbershopUserEmail) {
            emailService.sendTemplateEmail({
                to: payload.barbershopUserEmail,
                subject: `Fatura #${payload.invoiceId} Gerada`,
                template: 'invoice-created',
                userId: payload.userId,
                data: {
                    dueDate: payload.dueDate,
                    amount: payload.amount,
                    description: payload.description || 'Assinatura',
                    paymentLink: payload.paymentLink,
                    invoiceId: payload.invoiceId,
                    barbershop: payload.barbershopName,
                    logoUrl: `${process.env.FRONTEND_URL || 'https://appbarber.vercel.app'}/logos/logo_full.png`
                }
            });
        }
    } catch (err) { }
});

// Event: PASSWORD_RESET_REQUEST
eventBus.on('PASSWORD_RESET_REQUEST', async (payload) => {
    try {
        await prisma.notification.create({
            data: {
                userId: payload.userId, // Can be authUser ID if generic, or linked user. Schema might need to allow authUserId or we just log it conceptually.
                title: 'Recuperação de Senha',
                message: `Um código de recuperação foi gerado.`,
                type: 'system'
            }
        });

        emailService.sendTemplateEmail({
            to: payload.email,
            subject: 'Recuperação de Senha - AppBarber',
            template: 'password-reset',
            userId: payload.userId,
            data: {
                resetCode: payload.resetCode,
                resetLink: payload.resetLink,
                logoUrl: `${process.env.FRONTEND_URL || 'https://appbarber.vercel.app'}/logos/logo_full.png`
            }
        });
    } catch (err) {
        console.error('[NotificationService] Password reset notification error:', err);
    }
});

// Event: AUTH_2FA_CODE
eventBus.on('AUTH_2FA_CODE', async (payload) => {
    // payload: { email, otp, method, phone, userId }
    console.log(`[NotificationService] Event Received: AUTH_2FA_CODE for ${payload.email}. Method: ${payload.method}`);

    const method = (payload.method || 'EMAIL').toUpperCase().trim();

    if (method === 'EMAIL') {
        try {
            console.log(`[NotificationService] Attempting to send 2FA email to ${payload.email}...`);
            await emailService.sendTemplateEmail({
                to: payload.email,
                subject: 'Código de Verificação - Next App',
                template: 'auth-otp',
                userId: payload.userId,
                data: {
                    otp: payload.otp,
                    logoUrl: `${process.env.FRONTEND_URL || 'https://appbarber.vercel.app'}/logos/logo_full.png`
                }
            });
            console.log(`[NotificationService] 2FA Email sent successfully to ${payload.email}`);
        } catch (err) {
            console.error('[NotificationService] Failed to send 2FA Email:', err);
        }
    } else if (method === 'SMS' && payload.phone) {
        try {
            console.log(`[NotificationService] Attempting to send 2FA SMS to ${payload.phone}...`);
            const message = `Seu código de acesso ao Next App é: ${payload.otp}. Válido por 10 minutos.`;
            await whatsappService.sendText(payload.phone, message);
            console.log(`[NotificationService] 2FA SMS sent successfully to ${payload.phone}`);
        } catch (err) {
            console.error('[NotificationService] SMS 2FA delivery failed:', err);
        }
    } else {
        console.warn(`[NotificationService] Unknown or missing 2FA method: ${method}`);
    }
});

module.exports = {
    init: () => console.log('[NotificationService] Module active.')
};
