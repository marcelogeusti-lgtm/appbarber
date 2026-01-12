const axios = require('axios');

/**
 * WhatsApp Notifier Service
 * Defines a structural interface for sending notifications.
 * Does NOT depend on Database for message history.
 * Does NOT throw errors that block the main thread (catches internally).
 */

exports.sendConfirmation = async (appointment, eventType = 'AGENDAMENTO_CONFIRMADO') => {
    try {
        console.log(`[WhatsappNotifier] Processing ${eventType} for Appointment ${appointment.id}`);

        // 1. Extract Data
        const { client, service, professional, barbershop, date, paymentMethod } = appointment;
        if (!client || !client.phone) {
            console.log('[WhatsappNotifier] Skipped: No client phone.');
            return;
        }

        // 2. Prepare Payload (Standardized)
        const payload = {
            event: eventType,
            agendamento: {
                id: appointment.id,
                data: date.toISOString().split('T')[0], // YYYY-MM-DD
                hora: date.toISOString().split('T')[1].substring(0, 5), // HH:MM
                valor: Number(service.price),
                servico: {
                    id: service.id,
                    nome: service.name
                }
            },
            cliente: {
                id: client.id,
                nome: client.name,
                telefone: client.phone
            },
            barbeiro: {
                id: professional.id,
                nome: professional.name
            },
            barbearia: {
                nome: barbershop.name,
                telefone: barbershop.phone
            },
            timestamp: new Date().toISOString()
        };

        // 3. Send to Provider (e.g., Evolution API, Z-API)
        // Check if Barbershop has a specific webhook or if we use a global env
        const instanceUrl = process.env.WHATSAPP_API_URL;
        const instanceToken = process.env.WHATSAPP_API_TOKEN;

        if (!instanceUrl || !instanceToken) {
            console.warn('[WhatsappNotifier] No WhatsApp API credentials configured.');
            return;
        }

        // Clean phone number (remove non-digits, ensure 55)
        let phone = client.phone.replace(/\D/g, '');
        if (!phone.startsWith('55')) phone = '55' + phone;

        const messageText = formatMessage(payload);

        // Call External API
        await axios.post(`${instanceUrl}/message/sendText/${process.env.WHATSAPP_INSTANCE_NAME}`, {
            number: phone,
            options: {
                delay: 1200,
                presence: "composing",
                linkPreview: false
            },
            textMessage: {
                text: messageText
            }
        }, {
            headers: {
                apikey: instanceToken
            }
        });

        console.log(`[WhatsappNotifier] Message sent to ${phone}`);

    } catch (error) {
        // Log Error but DO NOT CRASH
        console.error('[WhatsappNotifier] Failed to send notification:', error.message);
        if (error.response) {
            console.error('Provider Response:', error.response.data);
        }
    }
};

function formatMessage(payload) {
    const { agendamento, cliente, barbeiro, barbearia } = payload;
    const dateFormatted = new Date(agendamento.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    // Adjust Time (UTC Fix) - naive approach, assuming payload had correct UTC or we rely on string
    // Better: Format the Date object passed in start

    return `✂️ *Agendamento Confirmado!*

Olá, ${cliente.nome} 👋
Seu horário foi reservado na *${barbearia.nome}*.

📅 Data: ${dateFormatted}
⏰ Horário: ${agendamento.hora} (Confira no App)
💈 Serviço: ${agendamento.servico.nome}
👤 Barbeiro: ${barbeiro.nome}
💰 Valor: R$ ${agendamento.valor.toFixed(2)}

Caso precise reagendar, entre em contato.
Nos vemos em breve! 🔥`;
}
