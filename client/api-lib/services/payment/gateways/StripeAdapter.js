const GatewayAdapter = require('./GatewayAdapter');
const axios = require('axios');

// Stripe via REST puro (sem SDK): PaymentIntents para cobrança de cartão.
// O fluxo é: backend cria o PaymentIntent -> frontend confirma com Stripe.js
// (Elements) usando o client_secret -> backend confirma o status via API.
class StripeAdapter extends GatewayAdapter {
    constructor() {
        super();
        this.apiUrl = 'https://api.stripe.com/v1';
    }

    headers(secretKey) {
        return {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }

    mapStatus(stripeStatus) {
        if (stripeStatus === 'succeeded') return 'paid';
        if (['processing', 'requires_action', 'requires_confirmation', 'requires_payment_method', 'requires_capture'].includes(stripeStatus)) return 'pending';
        if (stripeStatus === 'canceled') return 'failed';
        return 'pending';
    }

    async createPayment({ amount, currency, description, customer, credentials, metadata }) {
        const secretKey = credentials?.secretKey || process.env.STRIPE_SECRET_KEY;
        if (!secretKey) throw new Error('Stripe Secret Key missing.');

        try {
            const params = new URLSearchParams();
            params.append('amount', Math.round(amount * 100)); // Stripe usa centavos
            params.append('currency', (currency || credentials?.currency || 'brl').toLowerCase());
            if (description) params.append('description', description);
            if (customer?.email) params.append('receipt_email', customer.email);
            params.append('automatic_payment_methods[enabled]', 'true');
            params.append('automatic_payment_methods[allow_redirects]', 'never'); // só cartão no MVP
            if (metadata) {
                Object.entries(metadata).forEach(([k, v]) => {
                    if (v !== undefined && v !== null) params.append(`metadata[${k}]`, String(v));
                });
            }

            const response = await axios.post(`${this.apiUrl}/payment_intents`, params, {
                headers: this.headers(secretKey),
                timeout: 20000
            });

            return {
                externalId: response.data.id,
                paymentId: response.data.id,
                clientSecret: response.data.client_secret,
                status: this.mapStatus(response.data.status),
                gateway: 'stripe',
                rawResponse: response.data
            };
        } catch (err) {
            console.error('[Stripe] Create Payment Error:', err.response?.data || err.message);
            throw new Error(`Erro Stripe: ${err.response?.data?.error?.message || err.message}`);
        }
    }

    async getPaymentStatus({ externalId, credentials }) {
        const secretKey = credentials?.secretKey || process.env.STRIPE_SECRET_KEY;
        if (!secretKey) throw new Error('Stripe Secret Key missing.');

        try {
            const response = await axios.get(`${this.apiUrl}/payment_intents/${externalId}`, {
                headers: { 'Authorization': `Bearer ${secretKey}` },
                timeout: 20000
            });

            return {
                externalId: response.data.id,
                status: this.mapStatus(response.data.status),
                statusDetail: response.data.last_payment_error?.message || response.data.status,
                rawResponse: response.data
            };
        } catch (err) {
            console.error('[Stripe] Get Status Error:', err.response?.data || err.message);
            throw new Error(`Erro ao consultar Stripe: ${err.response?.data?.error?.message || err.message}`);
        }
    }

    // Valida a chave chamando um endpoint autenticado barato
    async testConnection({ credentials }) {
        const secretKey = credentials?.secretKey;
        if (!secretKey) return false;
        try {
            await axios.get(`${this.apiUrl}/balance`, {
                headers: { 'Authorization': `Bearer ${secretKey}` },
                timeout: 15000
            });
            return true;
        } catch {
            return false;
        }
    }

    // Webhook: não confiamos no payload — re-consultamos o PaymentIntent na API
    // com as credenciais da barbearia (resolvidas pelo orchestrator via Payment.externalId).
    async processWebhook(req, credentials) {
        const event = req.body || {};
        const object = event.data?.object || {};
        const intentId = object.object === 'payment_intent' ? object.id : object.payment_intent;

        if (!intentId) return { isValid: false, error: 'Evento Stripe sem payment_intent' };

        try {
            const statusData = await this.getPaymentStatus({ externalId: intentId, credentials });
            let status = statusData.status;
            // Estorno chega como charge.refunded — o PI continua succeeded, então
            // marcamos explicitamente pelo tipo do evento
            if (event.type === 'charge.refunded') status = 'refunded';
            if (event.type === 'charge.dispute.created') status = 'chargeback';

            return {
                isValid: true,
                type: 'payment',
                externalId: intentId,
                status,
                statusDetail: statusData.statusDetail,
                raw: statusData.rawResponse
            };
        } catch (err) {
            console.error('[Stripe Webhook] Process Error:', err.message);
            return { isValid: false, error: err.message };
        }
    }

    validateWebhook(req) {
        // A verificação real é feita re-consultando a API no processWebhook;
        // exigimos apenas o header padrão da Stripe como filtro básico.
        return !!req.headers['stripe-signature'];
    }
}

module.exports = StripeAdapter;
