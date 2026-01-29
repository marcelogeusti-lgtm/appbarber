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
        const { method, barbershopId, customer, amount, description, externalId } = params;

        const gatewayToUse = params.gateway || await this.getActiveGateway(barbershopId, method);
        const adapter = this.gateways[gatewayToUse];

        if (!adapter) throw new Error(`Gateway '${gatewayToUse}' not supported.`);

        console.log(`[Orchestrator] Creating ${method} via ${gatewayToUse} for Shop ${barbershopId}`);

        // Get credentials
        const credentials = await this.getGatewayConfig(barbershopId, gatewayToUse);

        const result = await adapter.createPayment({
            ...params, // Pass all params (token, installments, etc)
            amount,
            description,
            customer,
            credentials,
            method,
            externalId // Pass the unique Payment ID to the adapter
        });

        // Standardized Response
        return {
            paymentId: result.externalId,
            status: result.status || 'pending',
            method,
            gateway: gatewayToUse,
            qrCode: result.qrCode || null,
            qrCodeBase64: result.qrCodeBase64 || null,
            pixCopiaECola: result.pixCopiaECola || result.qrCode || null, // Common alias
            clientSecret: result.clientSecret || null, // For Stripe/MP elements
            checkoutUrl: result.checkoutUrl || null
        };
    }

    async processWebhook(gatewayName, req) {
        const gateway = gatewayName.toLowerCase();
        const adapter = this.gateways[gateway];
        if (!adapter) throw new Error(`Webhook gateway '${gateway}' not supported.`);

        // 1. Basic Validation
        const isValid = await adapter.validateWebhook(req);
        if (!isValid) return { isValid: false };

        // 2. Extract External ID (psp_reference_id)
        // MP: req.body.data.id or req.body.id
        const externalId = (req.body.data?.id || req.body.id)?.toString();
        if (!externalId) return { isValid: true, status: 'ignore' };

        // 3. Status Mapping (Logic depends on Gateway)
        if (gateway === 'mercadopago') {
            // For MP, it's safer to fetch the payment status directly from their API
            // after receiving a notification, as the body might be just an ID.
            const paymentRecord = await this.getPaymentByExternalId(externalId);
            if (!paymentRecord) return { isValid: true, status: 'not_found' };

            const credentials = await this.getGatewayConfig(paymentRecord.barbershopId, 'MERCADOPAGO');

            // Use dedicated getPaymentStatus method
            const response = await adapter.getPaymentStatus({
                externalId,
                credentials
            });

            return {
                isValid: true,
                externalId,
                status: response.status
            };
        } else if (gateway === 'velfy') {
            // PixOne Webhook Structure
            // { id, type: 'transaction', data: { object: { status, externalRef, ... } } }
            const data = req.body.data?.object;
            const statusMap = {
                'paid': 'APPROVED',
                'approved': 'APPROVED',
                'pending': 'PENDING',
                'cancelled': 'CANCELLED',
                'refunded': 'REFUNDED'
            };

            const pixOneStatus = data?.status;
            const mappedStatus = statusMap[pixOneStatus] || 'UNKNOWN';
            const ref = data?.externalRef; // This is our internal Payment UUID if we passed it correctly

            console.log(`[Orchestrator] PixOne Webhook for Ref ${ref}: ${pixOneStatus} -> ${mappedStatus}`);

            return {
                isValid: true,
                externalId: ref, // Return the internal ID if possible, or we need to find by external
                status: mappedStatus,
                isInternalId: true // Signal that externalId returned here IS the internal UUID
            };
        }

        return { isValid: true, externalId, status: 'unknown' };
    }

    async getPaymentByExternalId(externalId) {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        return await prisma.payment.findFirst({
            where: { externalId }
        });
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
