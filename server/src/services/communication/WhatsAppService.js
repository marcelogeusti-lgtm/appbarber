const axios = require('axios');
const prisma = require('../../lib/prisma');

/**
 * WhatsAppService - Multi-tenant Evolution API v2 Integration
 * Each Barbershop connects to its own WhatsApp Instance.
 */
class WhatsAppService {
    constructor() {
        this.apiBaseUrl = process.env.WHATSAPP_API_URL; // e.g. https://evo.yourdomain.com
        this.apiKey = process.env.WHATSAPP_API_TOKEN; // Global API Key
        this.globalWebhookUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/webhooks/evolution`;
        this.isMocked = !this.apiBaseUrl || !this.apiKey;
        this.configLoaded = false;
        
        // Initial load
        this.refreshConfig();
    }

    async refreshConfig() {
        try {
            const settings = await prisma.platformSetting.findMany();
            let dbUrl, dbToken;
            
            for (const s of settings) {
                if (s.key === 'WHATSAPP_API_URL') dbUrl = s.value;
                if (s.key === 'WHATSAPP_API_TOKEN') dbToken = s.value;
            }

            // DB takes precedence over process.env
            if (dbUrl) this.apiBaseUrl = dbUrl;
            if (dbToken) this.apiKey = dbToken;

            this.isMocked = !this.apiBaseUrl || !this.apiKey;
            this.configLoaded = true;
            console.log('[WhatsAppService] Config refreshed from DB. Mocked:', this.isMocked);
        } catch (error) {
            console.error('[WhatsAppService] Failed to load config from DB:', error.message);
        }
    }

    async ensureConfig() {
        if (!this.configLoaded) {
            await this.refreshConfig();
        }
    }

    getHeaders() {
        return {
            'apikey': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Helper to get instance status from Evolution API
     */
    async fetchConnectionState(instanceName) {
        await this.ensureConfig();
        if (this.isMocked) return null; // Let the route rely on DB state or mock state
        try {
            const response = await axios.get(`${this.apiBaseUrl}/instance/connectionState/${instanceName}`, {
                headers: this.getHeaders()
            });
            // Possible states: open, connecting, close
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null; // Instance doesn't exist yet
            }
            throw error;
        }
    }

    /**
     * Create an instance and set the webhook
     */
    async createInstance(instanceName) {
        await this.ensureConfig();
        if (this.isMocked) {
            console.log(`[WhatsAppService] MOCK: Created instance ${instanceName}`);
            return { instanceName };
        }

        // First check if it exists
        const state = await this.fetchConnectionState(instanceName);
        if (state) return state; // Already exists

        // Create Instance
        const response = await axios.post(`${this.apiBaseUrl}/instance/create`, {
            instanceName,
            token: "",
            qrcode: true,
            webhook: this.globalWebhookUrl,
            events: [
                "MESSAGES_UPSERT",
                "CONNECTION_UPDATE"
            ]
        }, {
            headers: this.getHeaders()
        });

        // Evolution API v2 create route can set webhook directly if supported,
        // or we need to call /webhook/set separately.
        try {
            await axios.post(`${this.apiBaseUrl}/webhook/set/${instanceName}`, {
                url: this.globalWebhookUrl,
                webhookByEvents: false,
                webhookBase64: false,
                events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
            }, {
                headers: this.getHeaders()
            });
        } catch (e) {
            console.error(`[WhatsAppService] Failed to set webhook for ${instanceName}:`, e.message);
        }

        return response.data;
    }

    /**
     * Get QR Code for an instance (creates it if it doesn't exist)
     */
    async getQRCode(instanceName) {
        await this.ensureConfig();
        if (this.isMocked) {
            // Return a simple 1x1 base64 transparent image or a generic placeholder QR
            return { base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=' };
        }

        // Ensure instance exists
        await this.createInstance(instanceName);

        const response = await axios.get(`${this.apiBaseUrl}/instance/connect/${instanceName}`, {
            headers: this.getHeaders()
        });
        
        // Returns { base64: "...", pairingCode: "..." }
        return response.data;
    }

    /**
     * Logout and delete the instance
     */
    async logoutInstance(instanceName) {
        await this.ensureConfig();
        if (this.isMocked) {
            console.log(`[WhatsAppService] MOCK: Logged out instance ${instanceName}`);
            return true;
        }
        try {
            await axios.delete(`${this.apiBaseUrl}/instance/logout/${instanceName}`, {
                headers: this.getHeaders()
            });
            await axios.delete(`${this.apiBaseUrl}/instance/delete/${instanceName}`, {
                headers: this.getHeaders()
            });
            return true;
        } catch (error) {
            console.error(`[WhatsAppService] Failed to delete instance ${instanceName}:`, error.message);
            return false;
        }
    }

    /**
     * Sends a text message using the specific Barbershop Instance
     */
    async sendText(to, text, instanceName) {
        await this.ensureConfig();
        const cleanNumber = this.formatPhone(to);

        if (this.isMocked) {
            console.warn(`[WhatsAppService] Evolution API not configured. Mocking send to ${cleanNumber}`);
            return { success: true, method: 'mock' };
        }

        // Use 'default' if instanceName is missing (fallback to old centralized behavior if needed)
        const targetInstance = instanceName || process.env.WHATSAPP_INSTANCE_NAME || 'default';

        try {
            const url = `${this.apiBaseUrl}/message/sendText/${targetInstance}`;
            await axios.post(url, {
                number: cleanNumber,
                text: text
            }, {
                headers: this.getHeaders()
            });
            return { success: true, method: 'api' };
        } catch (error) {
            console.error(`[WhatsAppService] API Send Failed for instance ${targetInstance}:`, error.response?.data || error.message);
            return { success: false, error: error.message };
        }
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
}

module.exports = new WhatsAppService();
