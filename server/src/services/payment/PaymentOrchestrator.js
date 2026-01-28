const VelfyAdapter = require('./gateways/VelfyAdapter');
const MercadoPagoAdapter = require('./gateways/MercadoPagoAdapter');
const StripeAdapter = require('./gateways/StripeAdapter');

class PaymentOrchestrator {
    constructor() {
        this.gateways = {
            velfy: new VelfyAdapter(),
            mercadopago: new MercadoPagoAdapter(),
            stripe: new StripeAdapter()
        };
    }

    /**
     * Determines which gateway to use based on requested method and shop config
     */
    async getActiveGateway(barbershopId, method = 'PIX') {
        if (!barbershopId) return 'velfy';

        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            // Find active gateway for this shop
            const activeConfigs = await prisma.gatewayConfig.findMany({
                where: { barbershopId, isActive: true }
            });

            if (activeConfigs.length === 0) return 'velfy';

            // Strategy: 
            // If PIX, prioritize Velify or MercadoPago
            // If CARD, prioritize Stripe or MercadoPago
            if (method === 'PIX') {
                const preferred = activeConfigs.find(c => c.gateway === 'VELFY' || c.gateway === 'MERCADOPAGO');
                return (preferred?.gateway || activeConfigs[0].gateway).toLowerCase();
            } else {
                const preferred = activeConfigs.find(c => c.gateway === 'STRIPE' || c.gateway === 'MERCADOPAGO');
                return (preferred?.gateway || activeConfigs[0].gateway).toLowerCase();
            }
        } catch (e) {
            console.error(`[Orchestrator] Discovery Error: ${e.message}`);
            return 'velfy';
        }
    }

    async createPayment(params) {
        const { method, barbershopId, customer, amount, description } = params;

        const gatewayToUse = params.gateway || await this.getActiveGateway(barbershopId, method);
        const adapter = this.gateways[gatewayToUse];

        if (!adapter) throw new Error(`Gateway '${gatewayToUse}' not supported.`);

        console.log(`[Orchestrator] Creating ${method} via ${gatewayToUse} for Shop ${barbershopId}`);

        // Get credentials
        const credentials = await this.getGatewayConfig(barbershopId, gatewayToUse);

        const result = await adapter.createPayment({
            amount,
            description,
            customer,
            credentials,
            method
        });

        // Standardized Response
        return {
            paymentId: result.externalId,
            status: 'pending',
            method,
            gateway: gatewayToUse,
            qrCode: result.qrCode || null,
            qrCodeBase64: result.qrCodeBase64 || null,
            pixCopiaECola: result.qrCode || null, // Common alias
            clientSecret: result.clientSecret || null, // For Stripe/MP elements
            checkoutUrl: result.checkoutUrl || null
        };
    }

    async getGatewayConfig(barbershopId, gatewayName) {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const config = await prisma.gatewayConfig.findUnique({
            where: {
                barbershopId_gateway: {
                    barbershopId,
                    gateway: gatewayName.toUpperCase()
                }
            }
        });
        return config?.credentials || {};
    }
}

module.exports = new PaymentOrchestrator();
