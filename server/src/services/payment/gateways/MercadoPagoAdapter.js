const GatewayAdapter = require('./GatewayAdapter');
const axios = require('axios');

class MercadoPagoAdapter extends GatewayAdapter {
    constructor() {
        super();
        this.apiUrl = 'https://api.mercadopago.com/v1';
    }

    async createPayment({ amount, description, customer, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        try {
            const payload = {
                transaction_amount: parseFloat(amount),
                description: description,
                payment_method_id: 'pix', // Standard for dynamic pix
                payer: {
                    email: customer.email || 'guest@example.com',
                    first_name: customer.name?.split(' ')[0] || 'Cliente',
                    last_name: customer.name?.split(' ').slice(1).join(' ') || 'Visitante'
                },
                notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`
            };

            const response = await axios.post(`${this.apiUrl}/payments`, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Idempotency-Key': `pix_${Date.now()}`
                }
            });

            const data = response.data;
            return {
                externalId: data.id.toString(),
                qrCode: data.point_of_interaction?.transaction_data?.qr_code,
                qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
                status: data.status === 'approved' ? 'paid' : 'pending',
                rawResponse: data
            };
        } catch (err) {
            console.error('[MP] Create Payment Error:', err.response?.data || err.message);
            throw new Error(`Erro Mercado Pago: ${err.response?.data?.message || err.message}`);
        }
    }

    async createSubscription({ plan, customer, credentials }) {
        // MP Subscriptions logic
        return {
            subscriptionId: `sub_mp_${Date.now()}`,
            status: 'pending'
        };
    }

    validateWebhook(req) {
        // MP uses query params (id/topic) or header. 
        // Security usually involves checking the ID against their API.
        return true;
    }
}

module.exports = MercadoPagoAdapter;
