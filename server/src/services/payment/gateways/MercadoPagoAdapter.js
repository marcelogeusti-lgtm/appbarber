const GatewayAdapter = require('./GatewayAdapter');
const axios = require('axios');

class MercadoPagoAdapter extends GatewayAdapter {
    constructor() {
        super();
        this.apiUrl = 'https://api.mercadopago.com/v1';
    }

    async createPayment({ amount, description, customer, credentials, externalId, method, token, installments, issuerId, paymentMethodId, payer }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        try {
            const payload = {
                transaction_amount: parseFloat(amount),
                description: description,
                external_reference: externalId,
                notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`,
                payer: {
                    email: customer.email || 'guest@example.com',
                    first_name: customer.name?.split(' ')[0] || 'Cliente',
                    last_name: customer.name?.split(' ').slice(1).join(' ') || 'Visitante'
                }
            };

            if (method === 'PIX') {
                payload.payment_method_id = 'pix';
            } else if (method === 'BOLETO') {
                payload.payment_method_id = 'bolbradesco'; // Standard for BR
                if (payer?.identification) {
                    payload.payer.identification = payer.identification;
                }
            } else if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD') {
                // ... card logic
                if (!token) throw new Error("Token do cartão obrigatório para pagamentos via cartão.");

                payload.token = token;
                payload.installments = Number(installments) || 1;
                payload.payment_method_id = paymentMethodId;
                payload.issuer_id = issuerId;

                if (customerId) {
                    payload.payer = { ...payload.payer, id: customerId };
                }

                if (payer) {
                    payload.payer = { ...payload.payer, ...payer };
                }
            }

            const response = await axios.post(`${this.apiUrl}/payments`, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Idempotency-Key': `pay_${externalId}_${Date.now()}`
                }
            });

            const data = response.data;
            return {
                externalId: data.id.toString(),
                qrCode: data.point_of_interaction?.transaction_data?.qr_code,
                qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
                status: data.status === 'approved' ? 'paid' : (data.status === 'pending' || data.status === 'in_process' ? 'pending' : 'failed'),
                checkoutUrl: data.transaction_details?.external_resource_url, // For Boleto
                rawResponse: data
            };
        } catch (err) {
            console.error('[MP] Create Payment Error:', err.response?.data || err.message);
            throw new Error(`Erro Mercado Pago: ${err.response?.data?.message || err.message}`);
        }
    }

    async createCustomer({ email, name, phone, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        try {
            // Create
            const res = await axios.post(`${this.apiUrl}/customers`, {
                email,
                first_name: name?.split(' ')[0] || 'Cliente',
                last_name: name?.split(' ').slice(1).join(' ') || ''
            }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            return res.data; // { id: "..." }
        } catch (err) {
            console.error('[MP] Create Customer Error:', err.response?.data || err.message);
            throw new Error(`Falha ao criar cliente no MP: ${err.response?.data?.message || err.message}`);
        }
    }

    async saveCard({ customerId, token, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        try {
            const res = await axios.post(`${this.apiUrl}/customers/${customerId}/cards`, { token }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            return res.data; // { id: "...", first_six_digits, last_four_digits, ... }
        } catch (err) {
            console.error('[MP] Save Card Error:', err.response?.data || err.message);
            throw new Error(`Falha ao salvar cartão no MP: ${err.response?.data?.message || err.message}`);
        }
    }

    async createSubscription({ plan, customer, credentials }) {
        // MP Subscriptions logic
        return {
            subscriptionId: `sub_mp_${Date.now()}`,
            status: 'pending'
        };
    }

    async getPaymentStatus({ externalId, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        try {
            const response = await axios.get(`${this.apiUrl}/payments/${externalId}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            const data = response.data;
            return {
                externalId: data.id.toString(),
                status: data.status === 'approved' ? 'paid' : (data.status === 'pending' || data.status === 'in_process' ? 'pending' : 'failed'),
                rawResponse: data
            };
        } catch (err) {
            console.error('[MP] Get Status Error:', err.response?.data || err.message);
            throw new Error(`Erro ao buscar status no Mercado Pago: ${err.message}`);
        }
    }

    validateWebhook(req) {
        // Simple validation for MP: check if it has the required fields
        const body = req.body;
        return !!(body && (body.type === 'payment' || body.action?.includes('payment')));
    }
}

module.exports = MercadoPagoAdapter;
