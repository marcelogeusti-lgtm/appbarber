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
    async getActiveGateway(barbershopId) {
        if (!barbershopId) return 'velfy';

        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            // Find the ONLY active gateway for this shop
            const activeConfig = await prisma.gatewayConfig.findFirst({
                where: { barbershopId, isActive: true }
            });

            return activeConfig ? activeConfig.gateway.toLowerCase() : 'velfy';
        } catch (e) {
            console.error(`[Orchestrator] Discovery Error: ${e.message}`);
            return 'velfy';
        }
    }

    async createPayment(params) {
        const { method, barbershopId, customer, amount, description, externalId } = params;

        const gatewayToUse = params.gateway || await this.getActiveGateway(barbershopId);
        const adapter = this.gateways[gatewayToUse];

        if (!adapter) throw new Error(`Gateway '${gatewayToUse}' not supported.`);

        console.log(`[Orchestrator] Creating ${method} via ${gatewayToUse} for Shop ${barbershopId}`);

        // If paying with a saved card/token but no customerId, try to resolve it
        let customerId = params.customerId;
        if (!customerId && params.clientId && gatewayToUse !== 'velfy') {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            const gc = await prisma.gatewayCustomer.findUnique({
                where: {
                    clientId_gateway_barbershopId: {
                        clientId: params.clientId,
                        gateway: gatewayToUse.toUpperCase(),
                        barbershopId: barbershopId
                    }
                }
            });
            customerId = gc?.customerId;
        }

        // Get credentials
        const credentials = await this.getGatewayConfig(barbershopId, gatewayToUse);

        // --- SPLIT CALCULATION (If applicable) ---
        let disbursements = [];
        if (params.appointmentId && gatewayToUse === 'mercadopago') {
            try {
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                const appointment = await prisma.appointment.findUnique({
                    where: { id: params.appointmentId },
                    include: {
                        service: { include: { commissionOverrides: true } },
                        professional: true
                    }
                });

                if (appointment && appointment.professional.mpPayoutId) {
                    const service = appointment.service;
                    const override = service.commissionOverrides?.find(o => o.professionalId === appointment.professionalId);

                    let commType = override ? override.type : service.commissionType;
                    let commValue = override ? Number(override.value) : Number(service.commissionValue);

                    let splitAmount = 0;
                    const totalAmount = parseFloat(amount);

                    if (commType === 'PERCENTAGE') {
                        splitAmount = totalAmount * (commValue / 100);
                    } else {
                        splitAmount = Math.min(commValue, totalAmount);
                    }

                    if (splitAmount > 0) {
                        disbursements.push({
                            collector_id: appointment.professional.mpPayoutId,
                            amount: parseFloat(splitAmount.toFixed(2)),
                            external_reference: `pro_payout_${appointment.id}`
                        });
                        console.log(`[Orchestrator] Split calculated: ${splitAmount} for Pro ${appointment.professional.name}`);
                    }
                }
            } catch (splitErr) {
                console.error('[Orchestrator] Split Calc Error:', splitErr.message);
            }
        }

        const result = await adapter.createPayment({
            ...params,
            amount,
            description,
            customer,
            credentials,
            method,
            externalId,
            customerId,
            disbursements: disbursements.length > 0 ? disbursements : undefined
        });

        // Standardized Response
        return {
            paymentId: result.externalId,
            status: result.status || 'pending',
            method,
            gateway: gatewayToUse,
            qrCode: result.qrCode || null,
            qrCodeBase64: result.qrCodeBase64 || null,
            pixCopiaECola: result.pixCopiaECola || result.qrCode || null,
            clientSecret: result.clientSecret || null,
            checkoutUrl: result.checkoutUrl || null
        };
    }

    async saveCard({ barbershopId, client, token }) {
        // Only supports saving cards on gateways that support it (MP, Stripe)
        // Defaulting to MercadoPago for this implementation as requested
        const gatewayToUse = 'mercadopago'; // Could be dynamic
        const adapter = this.gateways[gatewayToUse];

        if (!adapter || !adapter.saveCard) throw new Error(`Gateway '${gatewayToUse}' does not support saving cards.`);

        const credentials = await this.getGatewayConfig(barbershopId, gatewayToUse);

        // 1. Ensure Customer Exists in Gateway
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        // Check if we already have a customer ID for this gateway
        let gatewayCustomer = await prisma.gatewayCustomer.findUnique({
            where: {
                clientId_gateway_barbershopId: {
                    clientId: client.id,
                    gateway: gatewayToUse.toUpperCase(),
                    barbershopId: barbershopId
                }
            }
        });

        let customerId = gatewayCustomer?.customerId;

        if (!customerId) {
            // Create Customer in Gateway
            console.log(`[Orchestrator] Creating Customer in ${gatewayToUse} for Client ${client.id}`);
            const newCustomer = await adapter.createCustomer({
                email: client.authUser?.email || `client-${client.id}@barber.com`,
                name: client.name,
                phone: client.phone,
                credentials
            });
            customerId = newCustomer.id;

            // Save Mapping
            await prisma.gatewayCustomer.create({
                data: {
                    clientId: client.id,
                    gateway: gatewayToUse.toUpperCase(),
                    customerId: customerId,
                    barbershopId: barbershopId
                }
            });
        }

        // 2. Save Card
        console.log(`[Orchestrator] Saving Card for Customer ${customerId} via ${gatewayToUse}`);
        const savedCard = await adapter.saveCard({
            customerId,
            token,
            credentials
        });

        // 3. Return Card Details (to be stored in CardToken)
        return {
            gateway: gatewayToUse,
            token: savedCard.id, // The Card ID in MP is the token for future charges
            last4: savedCard.last_four_digits,
            brand: savedCard.payment_method?.id || savedCard.issuer?.name || 'unknown',
            expiryMonth: savedCard.expiration_month,
            expiryYear: savedCard.expiration_year
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
        const crypto = require('../../utils/crypto');

        const config = await prisma.gatewayConfig.findUnique({
            where: {
                barbershopId_gateway: {
                    barbershopId,
                    gateway: gatewayName.toUpperCase()
                }
            }
        });

        if (!config || !config.credentials) return {};

        const credentials = { ...config.credentials };

        // Auto-decrypt secretKey if present
        const sensitiveFields = ['secretKey', 'accessToken', 'apiKey', 'clientSecret'];

        sensitiveFields.forEach(field => {
            if (credentials[field]) {
                const decrypted = crypto.decrypt(credentials[field]);
                // If decryption succeeds, use it. If not (e.g. older plain text or invalid), keep original.
                if (decrypted) {
                    credentials[field] = decrypted;
                }
            }
        });

        return credentials;
    }

    async getPublicKey(barbershopId) {
        // Default to MercadoPago for frontend SDK currently
        const gateway = 'MERCADOPAGO';
        const credentials = await this.getGatewayConfig(barbershopId, gateway);
        return credentials?.publicKey || process.env.MP_PUBLIC_KEY;
    }
}

module.exports = new PaymentOrchestrator();
