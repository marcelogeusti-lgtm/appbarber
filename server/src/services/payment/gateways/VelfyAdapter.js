const GatewayAdapter = require('./GatewayAdapter');
const axios = require('axios');
// const config = require('../config'); // Future config import

class VelfyAdapter extends GatewayAdapter {
    constructor() {
        super();
        this.apiUrl = process.env.VELFY_API_URL || 'https://api.velfy.com'; // Placeholder
        this.apiKey = process.env.VELFY_API_KEY;
    }

    async createPayment({ amount, description, customer, credentials, externalId }) {
        // Use credentials passed from Orchestrator (from DB)
        const publicKey = credentials?.publicKey;
        const secretKey = credentials?.secretKey;
        const apiUrl = credentials?.apiUrl || this.apiUrl;

        // Mock Implementation until API Docs are confirmed
        console.log('[Velfy] Creating Payment:', amount, 'using Keys:', publicKey ? '***' : 'Missing', secretKey ? '***' : 'Missing');

        // Real call would be:
        // const response = await axios.post(`${apiUrl}/pix/cob`, { ... }, { headers: { Authorization: apiKey } });

        // Returning Mock Data for now
        return {
            externalId: `velify_${Date.now()}`,
            qrCode: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540410.005802BR5913Cicrano de Tal6008Brasilia62070503***6304E2CA",
            qrCodeBase64: null, // Usually PIX returns payload string, base64 for image is optional
            status: 'pending',
            rawResponse: {}
        };
    }

    validateWebhook(req) {
        // Implement security check (IP Whitelist or Signature)
        const signature = req.headers['x-velfy-signature'];
        if (process.env.NODE_ENV === 'development') return true;

        // TODO: Validate signature
        return !!signature;
    }
}

module.exports = VelfyAdapter;
