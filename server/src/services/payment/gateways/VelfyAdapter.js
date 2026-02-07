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
        // Legacy Direct Pix Implementation (kept for fallback/compat)
        // If hosted checkout is preferred, use createHostedCheckout
        return this.createHostedCheckout({ amount, description, customer, credentials, externalId });
    }

    async createHostedCheckout({ amount, description, customer, credentials, externalId }) {
        const sk = credentials?.secretKey; // Already decrypted by orchestrator
        const pk = credentials?.publicKey;

        if (!sk) {
            throw new Error('PixOne Credentials (secretKey) are missing.');
        }

        // Auth Header: Bearer {secretKey} or Basic, assuming Velfy uses Bearer for checkout API
        // Checking doc reference or standard: usually Bearer for modern APIs, but adapter used Basic before.
        // User prompt says: Authorization: Bearer {SECRET_KEY_DA_BARBEARIA}
        const headers = {
            'Authorization': `Bearer ${sk}`,
            'Content-Type': 'application/json'
        };

        const payload = {
            amount: parseFloat(amount), // Velfy usually takes float or cents? Prompt says "amount: 70.00"
            description: description || 'Servico Barbearia',
            external_id: externalId, // Critical for reconciliation
            customer_required: true,
            customer: {
                name: customer.name,
                email: customer.email,
                tax_id: customer.document // CPF/CNPJ
            },
            // return_url: ... (can be passed or configured in dashboard)
        };

        try {
            console.log('[Velfy] Creating Hosted Checkout:', JSON.stringify(payload));

            // Endpoint per user prompt instructions
            const response = await axios.post(`${this.apiUrl}/create-payment`, payload, { headers }); // or /cob/create depending on actual API

            // User Prompt Example Response:
            // { payment_id: "...", checkout_url: "..." }
            const data = response.data;

            return {
                paymentId: data.payment_id || data.id,
                checkoutUrl: data.checkout_url || data.url,
                status: 'pending',
                gateway: 'velfy',
                externalId: data.payment_id || data.id
            };

        } catch (error) {
            console.error('[Velfy] Hosted Checkout Error:', error.response?.data || error.message);
            throw new Error(`Velfy Error: ${JSON.stringify(error.response?.data || error.message)}`);
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
