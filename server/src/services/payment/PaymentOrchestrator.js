const VelifyAdapter = require('./gateways/VelifyAdapter');
const MercadoPagoAdapter = require('./gateways/MercadoPagoAdapter');
const StripeAdapter = require('./gateways/StripeAdapter');

class PaymentOrchestrator {
    constructor() {
        this.gateways = {
            velify: new VelifyAdapter(),
            mercadopago: new MercadoPagoAdapter(),
            stripe: new StripeAdapter()
        };
    }

    /**
     * Helper to get Gateway Credentials from DB
     */
    async getGatewayConfig(barbershopId, gatewayName) {
        if (!barbershopId) throw new Error("Barbershop ID required for payment.");

        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            const config = await prisma.gatewayConfig.findUnique({
                where: {
                    barbershopId_gateway: {
                        barbershopId,
                        gateway: gatewayName
                    }
                }
            });

            if (!config || !config.isActive) {
                // Determine if we should fallback to system env (Hybrid mode)?
                // For now, Strict Mode: Must be in DB.
                throw new Error(`Gateway '${gatewayName}' not configured or active for this barbershop.`);
            }

            return config.credentials;
        } catch (err) {
            console.error(`[Orchestrator] Config Error: ${err.message}`);
            throw err;
        }
    }

    /**
     * Unified Create Payment
     */
    async createPayment(params) {
        const { gateway: requestedGateway, customer, barbershopId, ...paymentData } = params;

        // Logic to choose gateway if not provided?
        // Prioritize requestedGateway, else check what's active (future logic)
        const gatewayToUse = requestedGateway || 'velify'; // Defaulting for now

        const adapter = this.gateways[gatewayToUse];
        if (!adapter) throw new Error(`Gateway '${gatewayToUse}' adapter not found.`);

        console.log(`[Orchestrator] Routing payment to ${gatewayToUse} for Shop ${barbershopId}`);

        // Fetch Credentials Dynamic
        let credentials = {};
        if (barbershopId) {
            try {
                credentials = await this.getGatewayConfig(barbershopId, gatewayToUse);
            } catch (e) {
                console.warn(`[Orchestrator] Warning: ${e.message}. Using default/env creds if available.`);
                // Fallback to Env if allowed, or fail. 
                // For safety in this transition phase, let's allow it to proceed with empty creds
                // so the Adapter can fallback to its own process.env check.
            }
        }

        // Call Adapter with CREDS
        const result = await adapter.createPayment({
            ...paymentData,
            customer,
            credentials
        });

        return {
            ...result,
            gateway: gatewayToUse
        };
    }

    async processWebhook(gatewayName, req) {
        const adapter = this.gateways[gatewayName];
        if (!adapter) throw new Error(`Gateway '${gatewayName}' not found.`);

        // 1. Validate
        if (!adapter.validateWebhook(req)) {
            throw new Error('Invalid Webhook Signature');
        }

        // 2. Parse Event (Delegate to Adapter later, but for now common logic)
        const body = req.body;
        let externalId = null;
        let status = 'pending';

        if (gatewayName === 'mercadopago') {
            // MP Webhooks can be 'payment' topic
            externalId = body.data?.id || body.id;
            // Need to fetch status if not in body, but usually it's there or we fetch it
            status = body.status === 'approved' ? 'paid' : 'pending';
        } else if (gatewayName === 'stripe') {
            externalId = body.data?.object?.id;
            status = body.type === 'payment_intent.succeeded' ? 'paid' : 'pending';
        } else {
            // Velify / Default
            externalId = body.id || body.external_id;
            status = body.status === 'approved' || body.status === 'paid' ? 'paid' : 'pending';
        }

        return {
            isValid: true,
            externalId: externalId?.toString(),
            status,
            rawEvent: body
        };
    }
}

module.exports = new PaymentOrchestrator();
