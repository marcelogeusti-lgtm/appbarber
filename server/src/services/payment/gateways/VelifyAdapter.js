const GatewayAdapter = require('./GatewayAdapter');
const axios = require('axios');
// const config = require('../config'); // Future config import

class VelifyAdapter extends GatewayAdapter {
    constructor() {
        super();
        this.apiUrl = process.env.VELIFY_API_URL || 'https://api.velify.com'; // Placeholder
        this.apiKey = process.env.VELIFY_API_KEY;
    }

    async createPayment({ amount, description, customer }) {
        // Mock Implementation until API Docs are confirmed or Keys provided
        console.log('[Velify] Creating Payment:', amount);

        // Real call would be:
        // const response = await axios.post(`${this.apiUrl}/pix/cob`, { ... });

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
        const signature = req.headers['x-velify-signature'];
        if (process.env.NODE_ENV === 'development') return true;

        // TODO: Validate signature
        return !!signature;
    }
}

module.exports = VelifyAdapter;
