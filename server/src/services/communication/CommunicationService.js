const prisma = require('../../lib/prisma');
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
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
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

        // --- UPSELL LOGIC ---
        // If the service doesn't contain words like "Barba" or "Sobrancelha" or "Combo", we can offer an upsell.
        const serviceNameLower = service.name.toLowerCase();
        if (!serviceNameLower.includes('barba') && !serviceNameLower.includes('sobrancelha') && !serviceNameLower.includes('combo')) {
            messageContent += `\n\n💡 *Dica:* Deseja aproveitar e adicionar outro serviço como Barba ou Sobrancelha? Responda 'SIM' e nós te ajudamos!`;
        }

        // 1. WhatsApp
        if (client.phone) {
            try {
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'REMINDER', messageContent, 'SENT');
            } catch (error) {
                console.error('Failed to send WA Reminder:', error);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'REMINDER', messageContent, 'FAILED');
            }
        }
    }

    // Send Cancellation Notice
    async sendCancellationNotice(appointment) {
        const { client, service, date, barbershop } = appointment;
        const formattedDate = new Date(date).toLocaleDateString('pt-BR');
        const bookingLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/agendamento/${barbershop.slug}`;

        // Fetch Template
        const template = await this.getTemplate('CANCELLATION', barbershop.id);

        let messageContent = template
            ? template.content
            : `❌ *Agendamento Cancelado*\n\nOlá, ${client.name}.\nSeu agendamento para ${service.name} em ${formattedDate} foi cancelado.\n\nSe desejar reagendar, acesse:\n🔗 ${bookingLink}`;

        // Ensure template active
        if (template && !template.active) {
            console.log(`Template CANCELLATION inactive for barbershop ${barbershop.id}`);
            return;
        }

        // Replace Variables
        messageContent = messageContent
            .replace('{{clientName}}', client.name)
            .replace('{{barbershopName}}', barbershop.name)
            .replace('{{date}}', formattedDate)
            .replace('{{serviceName}}', service.name)
            .replace('{{link}}', bookingLink);

        if (client.phone) {
            try {
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'CANCELLATION', messageContent, 'SENT');
            } catch (error) {
                console.error('Failed to send WA Cancellation:', error);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'CANCELLATION', messageContent, 'FAILED');
            }
        }

        // --- AUTOMATIC WAITLIST NOTIFICATION ---
        try {
            // Find the first pending user in the waitlist for exactly this date and professional
            const nextInWaitlist = await prisma.waitlist.findFirst({
                where: {
                    barbershopId: barbershop.id,
                    professionalId: appointment.professionalId,
                    date: appointment.date.split('T')[0], // ensure format matches YYYY-MM-DD
                    status: 'PENDING'
                },
                orderBy: { createdAt: 'asc' } // first come, first served
            });

            if (nextInWaitlist && nextInWaitlist.clientPhone) {
                console.log(`[Waitlist Automation] Found user waiting: ${nextInWaitlist.clientName}. Sending notification.`);
                const waitlistMessage = `🚨 *Vaga Liberada!* 🚨\n\nOlá, ${nextInWaitlist.clientName}!\nAcabou de liberar um horário na *${barbershop.name}* para a data que você estava aguardando na lista de espera (${formattedDate}).\n\nCorra e garanta agora pelo link antes que outra pessoa pegue:\n🔗 ${bookingLink}\n\nResponda SIM ou NÃO se você conseguiu agendar.`;

                await whatsappService.sendText(nextInWaitlist.clientPhone, waitlistMessage, barbershop.slug);

                // Optional: Update waitlist status so we don't notify them again
                await prisma.waitlist.update({
                    where: { id: nextInWaitlist.id },
                    data: { status: 'NOTIFIED' }
                });

                await prisma.communicationLog.create({
                    data: {
                        barbershopId: barbershop.id,
                        channel: 'WHATSAPP',
                        direction: 'OUTBOUND',
                        type: 'WAITLIST_ALERT',
                        content: waitlistMessage,
                        status: 'SENT'
                    }
                });
            }
        } catch (waitlistErr) {
            console.error('[Waitlist Automation] Error checking waitlist on cancellation:', waitlistErr);
        }
    }

    // Send Thank You Message (Completion)
    async sendThankYouMessage(appointment) {
        const { client, service, barbershop } = appointment;
        const bookingLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/agendamento/${barbershop.slug}`;

        // Fetch Template
        const template = await this.getTemplate('COMPLETED_THANKS', barbershop.id);

        let messageContent = template
            ? template.content
            : `✂️ *Obrigado pela preferência, ${client.name}!*\n\nEsperamos que tenha gostado do atendimento na *${barbershop.name}*.\n\nPara garantir seu próximo horário, use o link:\n🔗 ${bookingLink}\n\nAté a próxima! 😄`;

        // Ensure template active
        if (template && !template.active) {
            console.log(`Template COMPLETED_THANKS inactive for barbershop ${barbershop.id}`);
            return;
        }

        // Replace Variables
        messageContent = messageContent
            .replace('{{clientName}}', client.name)
            .replace('{{barbershopName}}', barbershop.name)
            .replace('{{serviceName}}', service.name)
            .replace('{{link}}', bookingLink);

        if (client.phone) {
            try {
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'COMPLETED_THANKS', messageContent, 'SENT');
            } catch (error) {
                console.error('Failed to send WA Thank You:', error);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'COMPLETED_THANKS', messageContent, 'FAILED');
            }
        }
    }

    // Send Abandoned Cart Reminder
    async sendAbandonedCartReminder(appointment) {
        const { client, service, barbershop } = appointment;
        const bookingLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/agendamento/${barbershop.slug}`;

        let messageContent = `⚠️ *Horário Quase Expirando*\n\nOlá, ${client?.name || 'Cliente'}!\nNotamos que você selecionou o serviço *${service?.name || 'na barbearia'}* na *${barbershop?.name || 'Barbearia'}*, mas fechou a página antes do pagamento.\n\nA vaga ficará reservada por apenas mais alguns minutinhos.\n\nClique no link abaixo para concluir e garantir seu horário:\n🔗 ${bookingLink}`;

        if (client && client.phone) {
            try {
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'ABANDONED_CART', messageContent, 'SENT');
                return true;
            } catch (error) {
                console.error('Failed to send WA Abandoned Cart Reminder:', error);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'ABANDONED_CART', messageContent, 'FAILED');
                return false;
            }
        }
        return false;
    }

    // Send Late Payment Notice to Barber (Webhook Protection)
    async sendLatePaymentNoticeToBarber(appointment) {
        const { client, barbershop, professional } = appointment;

        let messageContent = `🚨 *ATENÇÃO - PAGAMENTO ATRASADO* 🚨\n\nO cliente *${client?.name || 'Desconhecido'}* realizou um pagamento que foi aprovado apenas AGORA pelo banco para uma vaga que o sistema já havia cancelado por expiração de limite de tempo.\n\nSugerimos que entre em contato com ele para:\n1. Encaixá-lo em outro horário (Usando esse pagamento como crédito)\n2. Ou estornar o valor no painel do gateway (Mercado Pago).\n\nPara não causar agendamento duplo, a vaga NÃO foi reativada automaticamente na sua agenda.`;

        // Send to shop whatsapp or professional phone
        const phone = barbershop?.whatsappPhone || professional?.phone;

        if (phone) {
            try {
                await whatsappService.sendText(phone, messageContent, barbershop.slug);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'LATE_WEBHOOK_WARNING', messageContent, 'SENT');
            } catch (error) {
                console.error('Failed to send Late Payment WA to Barber:', error);
            }
        }
    }

    // Send Payment Failed Notice (Rejected/Refused)
    async sendPaymentFailedNotice(appointment, reason) {
        const { client, barbershop, service } = appointment;
        const bookingLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/agendamento/${barbershop.slug}`;
        
        const reasonMsg = reason ? `\nMotivo informado: *${reason}*` : '';

        let messageContent = `❌ *Pagamento Recusado*\n\nOlá, ${client?.name || 'Cliente'}.\nSeu pagamento para o serviço *${service?.name}* na *${barbershop?.name}* não foi aprovado pelo cartão.${reasonMsg}\n\nO horário ainda está reservado por mais alguns minutos. Tente novamente com outro cartão ou via PIX:\n🔗 ${bookingLink}`;

        if (client && client.phone) {
            try {
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'PAYMENT_FAILED', messageContent, 'SENT');
            } catch (error) {
                console.error('Failed to send WA Payment Failed:', error);
            }
        }
    }

    // Send Payment Timeout Notice (Expired Booking)
    async sendPaymentTimeoutNotice(appointment) {
        const { client, barbershop, service, date } = appointment;
        const formattedDate = new Date(date).toLocaleDateString('pt-BR');
        const bookingLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/agendamento/${barbershop.slug}`;

        let messageContent = `⏰ *Reserva Expirada*\n\nOlá, ${client?.name || 'Cliente'}.\nComo o pagamento não foi concluído nos últimos 7 minutos, sua vaga para *${service?.name}* em *${formattedDate}* foi liberada na agenda.\n\nSe ainda quiser este horário, corra e tente agendar novamente:\n🔗 ${bookingLink}`;

        if (client && client.phone) {
            try {
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
                await this.log(appointment, 'WHATSAPP', 'OUTBOUND', 'PAYMENT_TIMEOUT', messageContent, 'SENT');
            } catch (error) {
                console.error('Failed to send WA Payment Timeout:', error);
            }
        }
    }

    // --- NEW FOLLOW-UP ENGINE METHODS ---

    async sendWinbackMessage(payload) {
        const { client, barbershop, professional } = payload;
        const bookingLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/agendamento/${barbershop.slug}`;
        
        const messageContent = `Fala ${client.name}! Tranquilo? ✂️\n\nJá faz um tempinho desde o seu último trato no visual com o ${professional.name}.\n\nQue tal dar aquele talento pra esse fim de semana? Tem uns horários bons disponíveis na *${barbershop.name}*!\n\nGaranta sua vaga aqui:\n🔗 ${bookingLink}`;

        if (client.phone) {
            try {
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
                await prisma.communicationLog.create({
                    data: {
                        channel: 'WHATSAPP', direction: 'OUTBOUND', type: 'CLIENT_WINBACK',
                        content: messageContent, status: 'SENT', clientId: client.id, barbershopId: barbershop.id
                    }
                });
            } catch (error) {
                console.error('Failed to send Winback WA:', error);
            }
        }
    }

    async sendNPSRequest(appointment) {
        const { client, barbershop } = appointment;
        
        const messageContent = `Fala ${client.name}, como você está? 😄\n\nMuito obrigado pela sua visita hoje na *${barbershop.name}*!\n\nPara ajudar a melhorar nosso serviço, *de 1 a 5, qual nota você dá pro seu atendimento hoje?*\n(1 = Muito ruim, 5 = Sensacional)`;

        if (client.phone) {
            try {
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
                await prisma.communicationLog.create({
                    data: {
                        channel: 'WHATSAPP', direction: 'OUTBOUND', type: 'NPS_REQUEST',
                        content: messageContent, status: 'SENT', clientId: client.id, appointmentId: appointment.id, barbershopId: barbershop.id
                    }
                });
            } catch (error) {
                console.error('Failed to send NPS WA:', error);
            }
        }
    }

    async sendBirthdayMessage(payload) {
        const { client, barbershop } = payload;
        const bookingLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/agendamento/${barbershop.slug}`;
        
        const messageContent = `Parabéns, ${client.name}!! 🎂🎉\n\nHoje é seu dia e a *${barbershop.name}* não podia ficar de fora dessa festa.\n\nPra comemorar em grande estilo, vem dar um trato no visual! Temos um presente especial te esperando no seu próximo corte.\n\nAgende seu horário do Niver aqui:\n🔗 ${bookingLink}`;

        if (client.phone) {
            try {
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
                await prisma.communicationLog.create({
                    data: {
                        channel: 'WHATSAPP', direction: 'OUTBOUND', type: 'CLIENT_BIRTHDAY',
                        content: messageContent, status: 'SENT', clientId: client.id, barbershopId: barbershop.id
                    }
                });
            } catch (error) {
                console.error('Failed to send Birthday WA:', error);
            }
        }
    }

    async sendPackageExpiringMessage(payload) {
        const { client, barbershop, plan } = payload;
        const bookingLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/agendamento/${barbershop.slug}`;
        
        const messageContent = `Fala ${client.name}!\n\nO seu pacote *${plan.name}* na *${barbershop.name}* está acabando (resta apenas 1 serviço!). ⚠️\n\nQue tal já renovar o seu plano hoje pra não perder os seus benefícios no próximo mês?\n\nAcesse o link para assinar novamente:\n🔗 ${bookingLink}`;

        if (client.phone) {
            try {
                await whatsappService.sendText(client.phone, messageContent, barbershop.slug);
                await prisma.communicationLog.create({
                    data: {
                        channel: 'WHATSAPP', direction: 'OUTBOUND', type: 'PACKAGE_EXPIRING',
                        content: messageContent, status: 'SENT', clientId: client.id, barbershopId: barbershop.id
                    }
                });
            } catch (error) {
                console.error('Failed to send Package Expiring WA:', error);
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

    // --- Handling Incoming Messages (Smart Bot Layer) ---
    async handleIncomingMessage(data) {
        const { from, text, name: senderName, instance } = data;
        const phone = from.replace('@s.whatsapp.net', '');
        const normalizedText = text.toLowerCase().trim();

        // 1. Find Barbershop context
        let barbershop = null;
        if (instance) {
            // New Multi-tenant flow: we know exactly which barbershop received the message
            barbershop = await prisma.barbershop.findUnique({ where: { slug: instance } });
        }

        // Find the client (filtered by this barbershop if we found it)
        const clientQuery = { phone: { contains: phone } };
        if (barbershop) {
            clientQuery.appointments = { some: { barbershopId: barbershop.id } };
        }

        let client = await prisma.client.findFirst({
            where: clientQuery,
            include: { appointments: { take: 1, orderBy: { createdAt: 'desc' }, include: { barbershop: true } } }
        });

        // Fallback if client hasn't booked but just messaged
        if (!client) {
            client = await prisma.client.findFirst({
                where: { phone: { contains: phone } },
                include: { appointments: { take: 1, orderBy: { createdAt: 'desc' }, include: { barbershop: true } } }
            });
        }

        if (!client) {
            console.log(`[WA Bot] Ignored message from unregistered client: ${phone}`);
            return;
        }

        // If barbershop wasn't found by instance, fallback to last appointment
        if (!barbershop) {
            barbershop = client.appointments[0]?.barbershop;
            if (!barbershop) {
                const lastLog = await prisma.communicationLog.findFirst({
                    where: { clientId: client.id },
                    orderBy: { createdAt: 'desc' }
                });
                if (lastLog) barbershop = await prisma.barbershop.findUnique({ where: { id: lastLog.barbershopId } });
            }
        }

        if (!barbershop || !barbershop.whatsappAutoReply) {
            console.log(`[WA Bot] Auto-reply disabled for shop or context not found.`);
            return;
        }

        // 2. Business Hours Filter
        if (barbershop.whatsappBusinessHoursOnly) {
            const now = new Date();
            const hour = now.getHours();
            // Basic rule: 08:00 - 19:00 (Can be expanded to use real schedule table)
            if (hour < 8 || hour > 19) {
                console.log(`[WA Bot] Outside business hours: ${hour}h`);
                return;
            }
        }

        // 3. Keyword Processing & State Handling (NPS)
        let response = null;
        
        // --- Handle NPS Replies ---
        // Check if the last outbound message to this client was an NPS request recently (within 24 hours)
        const lastLog = await prisma.communicationLog.findFirst({
            where: { clientId: client.id, direction: 'OUTBOUND' },
            orderBy: { createdAt: 'desc' }
        });

        if (lastLog && lastLog.type === 'NPS_REQUEST' && ['1','2','3','4','5'].includes(normalizedText)) {
            // It's an NPS reply!
            const npsScore = parseInt(normalizedText);
            console.log(`[WA Bot] Received NPS Score ${npsScore} from ${client.name}`);

            if (npsScore >= 4) {
                const reviewLink = barbershop.googleReviewLink || 'o Google';
                response = `Sensacional, ${client.name}! 😍\nFicamos muito felizes que você gostou. \n\nFortalece a gente avaliando no Google? É bem rápido e nos ajuda demais!\n🔗 ${reviewLink}`;
            } else {
                response = `Poxa, ${client.name}... Pedimos desculpas se não alcançamos suas expectativas hoje. 😔\n\nJá passamos seu feedback direto para a gerência da ${barbershop.name} e vamos entrar em contato para entender como podemos melhorar!`;
                // Alert owner logic could be added here
            }

            // Mark NPS as received (Optional: save to an NPS table in the future)
            await prisma.communicationLog.create({
                data: {
                    barbershopId: barbershop.id,
                    clientId: client.id,
                    channel: 'WHATSAPP',
                    direction: 'INBOUND',
                    type: 'NPS_REPLY',
                    content: `NPS: ${npsScore}`,
                    status: 'RECEIVED'
                }
            });
        }

        // --- Standard Keyword Routing ---
        if (!response) {
            const keywords = barbershop.whatsappKeywords || {
                "agendar": "Olá! Para agendar seu horário agora, use o link abaixo:\n🔗 {{link}}",
                "marcar": "Olá! Para agendar seu horário agora, use o link abaixo:\n🔗 {{link}}",
                "horario": "Olá! Para agendar seu horário agora, use o link abaixo:\n🔗 {{link}}",
                "link": "Aqui está o link para agendamento:\n🔗 {{link}}"
            };

            const bookingLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/agendamento/${barbershop.slug}`;

            // Check exact match or includes
            for (const [key, msg] of Object.entries(keywords)) {
                if (normalizedText.includes(key)) {
                    response = msg.replace('{{link}}', bookingLink).replace('{{clientName}}', client.name);
                    break;
                }
            }

            // 4. Default Greeting if no keyword matched but bot is active
            if (!response && barbershop.whatsappWelcomeMessage) {
                response = barbershop.whatsappWelcomeMessage
                    .replace('{{link}}', bookingLink)
                    .replace('{{clientName}}', client.name);
            } else if (!response) {
                // Internal default fallback
                response = `Olá, ${client.name}! Para agendar seu serviço na *${barbershop.name}*, basta clicar no link:\n🔗 ${bookingLink}`;
            }
        }

        // 5. Send and Log (if we generated a response)
        if (response) {
            await whatsappService.sendText(phone, response, instance);
            await prisma.communicationLog.create({
                data: {
                    barbershopId: barbershop.id,
                    clientId: client.id,
                    channel: 'WHATSAPP',
                    direction: 'OUTBOUND',
                    type: 'AUTO_REPLY',
                    content: response,
                    status: 'SENT'
                }
            });
        }
    }
}


module.exports = new CommunicationService();
