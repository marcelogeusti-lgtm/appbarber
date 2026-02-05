const axios = require('axios');
const whatsAppProvider = require('./providers/WhatsAppProvider');

/**
 * WhatsAppService
 * Consolidates all WhatsApp communication logic.
 * Supports both direct Baileys connection (via WhatsAppProvider) 
 * and external API (Evolution API / WPPConnect style).
 */
class WhatsAppService {
    constructor() {
        this.apiBaseUrl = process.env.WHATSAPP_API_URL;
        this.apiKey = process.env.WHATSAPP_API_TOKEN;
        this.instanceName = process.env.WHATSAPP_INSTANCE_NAME;
    }

    /**
     * Sends a text message using the best available method.
     * Priority: 1. External API (if configured) | 2. Internal Baileys Provider
     */
    async sendText(to, text, barbershopId = null) {
        const cleanNumber = this.formatPhone(to);

        console.log(`[WhatsAppService] Sending message to ${cleanNumber}...`);

        // Method 1: External API (More stable for high volume)
        if (this.apiBaseUrl && this.apiKey) {
            try {
                // Adjusting endpoint based on common Evolution API structure
                const url = `${this.apiBaseUrl}/message/sendText/${this.instanceName || 'default'}`;
                await axios.post(url, {
                    number: cleanNumber,
                    text: text
                }, {
                    headers: { apikey: this.apiKey || '' }
                });
                return { success: true, method: 'api' };
            } catch (error) {
                console.error('[WhatsAppService] API Send Failed:', error.response?.data || error.message);
                // Fallback to internal provider if API fails
            }
        }

        // Method 2: Internal Provider (Baileys)
        try {
            if (whatsAppProvider.status === 'CONNECTED') {
                await whatsAppProvider.sendText(cleanNumber, text);
                return { success: true, method: 'provider' };
            } else {
                console.warn('[WhatsAppService] Internal Provider not connected. Status:', whatsAppProvider.status);
            }
        } catch (error) {
            console.error('[WhatsAppService] Internal Provider Send Failed:', error.message);
        }

        return { success: false, error: 'No connection available' };
    }

    /**
     * Standardizes phone numbers to international format without symbols.
     * e.g. " (11) 99999-9999" -> "5511999999999"
     */
    formatPhone(phone) {
        let p = phone.replace(/\D/g, '');
        if (p.length <= 11) p = '55' + p; // Add Brazil country code if missing
        return p;
    }

    /**
     * Formats and sends a structured template message.
     */
    async sendTemplate(to, templateType, data) {
        let message = '';

        switch (templateType) {
            case 'CONFIRMATION':
                message = `✅ *Agendamento Confirmado!*\n\nOlá, ${data.clientName}!\nSeu horário na *${data.barbershopName}* está reservado.\n\n📅 Data: ${data.date}\n⏰ Hora: ${data.time}\n💇‍♂️ Serviço: ${data.serviceName}\n\nTe aguardamos!`;
                break;
            case 'REMINDER':
                message = `⏰ *Lembrete de Horário*\n\nOpa, ${data.clientName}!\nPassando pra lembrar do seu horário hoje às *${data.time}* na ${data.barbershopName}.\n\nAté logo!`;
                break;
            default:
                message = data.text || '';
        }

        return this.sendText(to, message);
    }
}

module.exports = new WhatsAppService();
