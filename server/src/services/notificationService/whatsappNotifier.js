const axios = require('axios');
const prisma = require('../../lib/prisma');

exports.sendConfirmation = async (appointment) => {
    await processMessage(appointment, 'CONFIRMATION');
};

exports.sendReminder = async (appointment) => {
    await processMessage(appointment, 'REMINDER');
};

async function processMessage(appointment, type) {
    try {
        // 1. Validation: Does Barbershop have a sender number?
        if (!appointment.barbershop || !appointment.barbershop.whatsappPhone) {
            console.log('[WhatsappNotifier] Skipped: Barbershop has no WhatsApp configured.');
            return;
        }

        // 2. Validation: Does Client have a phone?
        if (!appointment.client || !appointment.client.phone) {
            console.log('[WhatsappNotifier] Skipped: Client has no phone number.');
            return;
        }

        // 3. Prepare Data
        const clientPhone = cleanPhone(appointment.client.phone);
        const barbershopName = appointment.barbershop.name;
        const msg = type === 'CONFIRMATION'
            ? formatConfirmationMessage(appointment)
            : formatReminderMessage(appointment);

        // 4. Send (Fail Safe)
        console.log(`[WhatsappNotifier] Sending ${type} to ${clientPhone} via ${appointment.barbershop.whatsappPhone}...`);

        // Mocking the API call setup here. Assuming "Evolution API" style or "WPPConnect"
        // This is a placeholder for the actual request logic, which depends on the user's provider.
        let status = 'PENDING';
        let errorMsg = null;

        try {
            if (process.env.WHATSAPP_API_URL) {
                await axios.post(`${process.env.WHATSAPP_API_URL}/message/sendText/${process.env.WHATSAPP_INSTANCE_NAME}`, {
                    number: clientPhone,
                    text: msg
                }, {
                    headers: {
                        apikey: process.env.WHATSAPP_API_TOKEN
                    }
                });
            } else {
                console.log('[WhatsappNotifier] Mock Send:', msg);
            }
            status = 'SENT';
        } catch (error) {
            status = 'FAILED';
            errorMsg = error.message;
            console.error(`[WhatsappNotifier] Failed to send API req for ${type}:`, error.message);
        }

        await prisma.messageLog.create({
            data: {
                type: 'WHATSAPP',
                recipient: clientPhone,
                body: msg,
                status: status,
                error: errorMsg,
                barbershopId: appointment.barbershopId
            }
        });

    } catch (error) {
        // Safe Catch: Should not propagate to main thread
        console.error(`[WhatsappNotifier] Error processing message ${type}:`, error.message);
    }
}

function cleanPhone(phone) {
    let p = phone.replace(/\D/g, '');
    if (!p.startsWith('55')) p = '55' + p;
    return p;
}

function formatConfirmationMessage(app) {
    const date = new Date(app.date).toLocaleDateString('pt-BR');
    const time = new Date(app.date).toISOString().split('T')[1].substring(0, 5); // Simple extraction or use moment-timezone if available

    return `✅ *Agendamento Confirmado!*
    
Olá, ${app.client.name}!
Seu horário na *${app.barbershop.name}* está reservado.

📅 Data: ${date}
⏰ Hora: ${time}
💇‍♂️ Profissional: ${app.professional.name}
💈 Serviço: ${app.service.name}

Te aguardamos!`;
}

function formatReminderMessage(app) {
    const time = new Date(app.date).toISOString().split('T')[1].substring(0, 5);

    return `⏰ *Lembrete de Horário*

Opa, ${app.client.name}!
Passando pra lembrar do seu horário hoje às *${time}* na ${app.barbershop.name}.

Até logo!`;
}
