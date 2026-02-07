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
        // Direct Pix Implementation
        // API V1 uses /transaction endpoint to generate QR Code.
        // It does NOT support distinct "Hosted Checkout" page URL in the response, 
        // so we return the QR Code data for the frontend to render.
        return this.createHostedCheckout({ amount, description, customer, credentials, externalId });
    }

    async createHostedCheckout({ amount, description, customer, credentials, externalId }) {
        const sk = credentials?.secretKey;
        const pk = credentials?.publicKey;

        if (!sk || !pk) {
            throw new Error('PixOne Credentials (secretKey or publicKey) are missing. Please configure them in Settings.');
        }

        // Docs: Authorization: Basic base64(sk:pk)
        const authString = Buffer.from(`${sk}:${pk}`).toString('base64');
        const headers = {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json'
        };

        const amountInCents = Math.round(parseFloat(amount) * 100);

        // API requires full URL for callbacks. 
        // We use APP_URL or VERCEL_URL if available, otherwise a placeholder that user must config.
        const baseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://api.seusite.com.br');
        const postbackUrl = `${baseUrl}/api/webhooks/velfy`;

        const payload = {
            paymentMethod: 'pix',
            amount: amountInCents,
            pix: {
                expiresInDays: 1
            },
            customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                document: {
                    type: customer.document && customer.document.length > 11 ? 'cnpj' : 'cpf',
                    number: customer.document ? customer.document.replace(/\D/g, '') : '00000000000'
                }
            },
            externalRef: externalId,
            postbackUrl: postbackUrl,
            traceable: true,
            items: [
                {
                    title: description || 'Servico',
                    quantity: 1,
                    unitPrice: amountInCents,
                    tangible: false
                }
            ],
            // ip: '127.0.0.1', // Docs say mandatory but let's try omitting or hardcoding valid IPv4 if needed.
            ip: '127.0.0.1',
            metadata: JSON.stringify({ externalId })
        };

        try {
            console.log('[Velfy] Creating Transaction:', JSON.stringify(payload));

            // Endpoint matches cURL example: https://api.pixone.com.br/api/v1/transaction
            // this.apiUrl is 'https://api.pixone.com.br/api/v1'
            const response = await axios.post(`${this.apiUrl}/transaction`, payload, { headers });

            const data = response.data;

            // Response usually has: { id, qrcode, copiaECola, ... }
            // API V1 might NOT return a hosted checkout URL, only QR Code.
            // If so, we return QRCode data and frontend must display it.
            // Our controller logic supports `qrCode` and `pixCopiaECola`.

            // Note: If data.url exists, we can use it as checkoutUrl, but likely it doesn't.

            return {
                paymentId: data.id || data.transactionId,
                checkoutUrl: data.url || null,
                qrCode: data.qrcode || data.qrCode,
                pixCopiaECola: data.emv || data.copiaECola || data.qrcode,
                status: 'pending',
                gateway: 'velfy',
                externalId: data.id || data.transactionId
            };

        } catch (error) {
            console.error('[Velfy] Transaction Error:', error.response?.data || error.message);
            throw new Error(`Velfy Error: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    }

    async validateWebhook(req) {
        // PixOne doesn't seem to have a signature header documented.
        return true;
    }

    // Helper to fetch status if needed
    async getPaymentStatus({ externalId, credentials }) {
        return { status: 'unknown' };
    }
}

module.exports = VelfyAdapter;
