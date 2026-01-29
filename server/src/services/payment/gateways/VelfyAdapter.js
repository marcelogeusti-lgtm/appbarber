const GatewayAdapter = require('./GatewayAdapter');
const axios = require('axios');
// const config = require('../config'); // Future config import

class VelfyAdapter extends GatewayAdapter {
    constructor() {
        super();
        this.apiUrl = process.env.VELFY_API_URL || 'https://api.pixone.com.br/api/v1';
    }

    async createPayment({ amount, description, customer, credentials, externalId }) {
        // PixOne Credentials
        // logic: publicKey = pk_userKey, secretKey = sk_userKey
        const sk = credentials?.secretKey;
        const pk = credentials?.publicKey;

        if (!sk || !pk) {
            throw new Error('PixOne Credentials (secretKey/publicKey) are missing in GatewayConfig.');
        }

        // Basic Auth: base64(sk:pk)
        const auth = Buffer.from(`${sk}:${pk}`).toString('base64');

        // Customer Data Formatting
        // Ensure strictly required fields are present
        const customerPayload = {
            name: customer.name || 'Cliente',
            email: customer.email || 'email@naoinformado.com',
            phone: customer.phone || '00000000000',
            document: {
                type: (customer.document?.length > 11) ? 'cnpj' : 'cpf', // Simple inference
                number: customer.document || '00000000000'
            }
        };

        const payload = {
            paymentMethod: 'pix',
            amount: Math.round(amount * 100), // PixOne uses cents
            pix: {
                expiresInDays: 1
            },
            items: [
                {
                    title: description || 'Servico',
                    quantity: 1,
                    tangible: false,
                    unitPrice: Math.round(amount * 100)
                }
            ],
            customer: customerPayload,
            externalRef: externalId, // Our Payment UUID
            postbackUrl: process.env.WEBHOOK_URL || 'https://meusite.com/api/webhook/pixone', // Ideally from env
            traceable: false,
            ip: '127.0.0.1', // Required by PixOne, valid IP needed ideally
            metadata: JSON.stringify({
                source: 'faturai_app'
            })
        };

        try {
            console.log('[PixOne] Sending Request:', JSON.stringify(payload));

            const response = await axios.post(`${this.apiUrl}/transactions`, payload, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = response.data;

            // PixOne response structure:
            // { paymentMethod: 'pix', pix: { qrcode: '...' }, status: 'pending', ... }

            return {
                externalId: data.data?.object?.id || data.id, // PixOne ID
                paymentId: data.data?.object?.id || data.id,
                qrCode: data.pix?.qrcode || data.qrcode,
                qrCodeBase64: null,
                pixCopiaECola: data.pix?.qrcode || data.qrcode,
                status: 'pending', // Usually pending immediately
                rawResponse: data
            };

        } catch (error) {
            console.error('[PixOne] Error:', error.response?.data || error.message);

            // Pass error up so Orchestrator can handle
            // If 401, it means invalid credentials -> Good for testing "Real" mode
            if (error.response?.status === 401) {
                throw new Error('PixOne Authentication Failed. Check keys.');
            }
            throw new Error(`PixOne Error: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    }

    async validateWebhook(req) {
        // PixOne doesn't seem to have a signature header documented in the chunks read.
        // We will trust it for now or check if "secretId" or similar matches tenant.
        // For now, return true to allow processing.
        return true;
    }

    // Helper to fetch status if needed (PixOne might not have a direct GET status endpoint doc'd used here, but we rely on Webhook)
    async getPaymentStatus({ externalId, credentials }) {
        // Not implemented in this chunk, assuming Webhook drives status
        return { status: 'unknown' };
    }
}

module.exports = VelfyAdapter;
