const VelifyAdapter = require('./gateways/VelifyAdapter');
// const MercadoPagoAdapter = require('./gateways/MercadoPagoAdapter'); // To be implemented
// const StripeAdapter = require('./gateways/StripeAdapter'); // To be implemented

class PaymentOrchestrator {
    constructor() {
        this.gateways = {
            velify: new VelifyAdapter(),
            // mercadopago: new MercadoPagoAdapter(),
            // stripe: new StripeAdapter()
        };
    }

    /**
     * Selects the appropriate gateway based on logic or explicit request
     * @param {String} gatewayName - Optional explicit gateway
     * @returns {GatewayAdapter}
     */
    getGateway(gatewayName = 'velify') {
        const gateway = this.gateways[gatewayName];
        if (!gateway) {
            throw new Error(`Gateway '${gatewayName}' not configured or not found.`);
        }
        return gateway;
    }

    /**
     * Unified Create Payment
     */
    async createPayment(params) {
        const { gateway: requestedGateway, ...paymentData } = params;

        // Logic to choose gateway if not provided?
        // For now default to Velify for PIX as requested.
        const gatewayToUse = requestedGateway || 'velify';
        const adapter = this.getGateway(gatewayToUse);

        console.log(`[Orchestrator] Routing payment to ${gatewayToUse}`);

        // Call Adapter
        const result = await adapter.createPayment(paymentData);

        return {
            ...result,
            gateway: gatewayToUse
        };
    }

    async processWebhook(gatewayName, req) {
        const adapter = this.getGateway(gatewayName);

        // 1. Validate
        if (!adapter.validateWebhook(req)) {
            throw new Error('Invalid Webhook Signature');
        }

        // 2. Parse Event (Adapter specific normalization could be added here)
        const event = req.body;

        console.log(`[Orchestrator] Processing ${gatewayName} webhook`, event?.type || 'Unknown Event');

        return {
            isValid: true,
            event
        };
    }
}

module.exports = new PaymentOrchestrator();
