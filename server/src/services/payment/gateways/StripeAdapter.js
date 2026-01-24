const GatewayAdapter = require('./GatewayAdapter');
const axios = require('axios');

class StripeAdapter extends GatewayAdapter {
    constructor() {
        super();
        this.apiUrl = 'https://api.stripe.com/v1';
    }

    async createPayment({ amount, description, customer, credentials }) {
        const secretKey = credentials?.secretKey || process.env.STRIPE_SECRET_KEY;
        if (!secretKey) throw new Error("Stripe Secret Key missing.");

        try {
            // 1. Create a PaymentIntent (Simple Flow)
            // For PIX in Stripe, we need to specify payment_method_types
            const params = new URLSearchParams();
            params.append('amount', Math.round(amount * 100)); // Stripe uses cents
            params.append('currency', 'brl');
            params.append('description', description);
            if (customer?.email) params.append('receipt_email', customer.email);

            // For simplicity in this SaaS, we'll return a generic success/pending 
            // and let the frontend use the publishable key for direct card entry if needed.
            // But here we return the client_secret.

            const response = await axios.post(`${this.apiUrl}/payment_intents`, params, {
                headers: {
                    'Authorization': `Bearer ${secretKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return {
                externalId: response.data.id,
                clientSecret: response.data.client_secret,
                status: response.data.status === 'succeeded' ? 'paid' : 'pending',
                rawResponse: response.data
            };
        } catch (err) {
            console.error('[Stripe] Create Payment Error:', err.response?.data || err.message);
            throw new Error(`Erro Stripe: ${err.response?.data?.error?.message || err.message}`);
        }
    }

    async createSubscription({ plan, customer, credentials }) {
        // Stripe Subscriptions logic: Create Price -> Create Customer -> Create Sub
        // For now, returning a mock or simplified ID
        return {
            subscriptionId: `sub_stripe_${Date.now()}`,
            status: 'pending'
        };
    }

    validateWebhook(req) {
        // Stripe webhook validation requires the raw body and stripe-signature header
        // For now returning true if signature exists
        return !!req.headers['stripe-signature'];
    }
}

module.exports = StripeAdapter;
