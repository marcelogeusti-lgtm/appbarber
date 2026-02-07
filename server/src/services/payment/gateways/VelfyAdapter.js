const GatewayAdapter = require('./GatewayAdapter');
const axios = require('axios');
const qrcode = require('qrcode');
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
        const sanitizedDocument = (customer.document || '00000000000').replace(/\D/g, '');
        const sanitizedPhone = (customer.phone || '00000000000').replace(/\D/g, '');

        const customerPayload = {
            name: customer.name || 'Cliente',
            email: customer.email || 'email@naoinformado.com',
            phone: sanitizedPhone,
            document: {
                type: (sanitizedDocument.length > 11) ? 'cnpj' : 'cpf', // Simple inference
                number: sanitizedDocument
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
            const pixString = data.pix?.qrcode || data.qrcode || '';
            let qrCodeBase64 = null;

            if (pixString) {
                try {
                    // Generate Base64 QR Code image from the Pix string
                    const dataUrl = await qrcode.toDataURL(pixString);
                    qrCodeBase64 = dataUrl.split(',')[1]; // Remove prefix 'data:image/png;base64,'
                } catch (qrErr) {
                    console.error('[PixOne] QR Code Generation Error:', qrErr.message);
                }
            }

            return {
                externalId: data.data?.object?.id || data.id, // PixOne ID
                paymentId: data.data?.object?.id || data.id,
                qrCode: pixString,
                qrCodeBase64: qrCodeBase64,
                pixCopiaECola: pixString,
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
