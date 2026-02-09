const MercadoPagoAdapter = require('./gateways/MercadoPagoAdapter');

class PaymentOrchestrator {
    constructor() {
        this.gateways = {
            mercadopago: new MercadoPagoAdapter()
        };
    }

    /**
     * Determines which gateway to use based on requested method and shop config
     */
    async getActiveGateway(barbershopId) {
        return 'mercadopago';
    }

    async createPayment(params) {
        const { method, barbershopId, customer, amount, description, externalId } = params;

        const gatewayToUse = 'mercadopago';
        const adapter = this.gateways[gatewayToUse];

        if (!adapter) throw new Error(`Gateway '${gatewayToUse}' not supported.`);

        console.log(`[Orchestrator] Creating ${method} via ${gatewayToUse} for Shop ${barbershopId}`);

        // If paying with a saved card/token but no customerId, try to resolve it
        let customerId = params.customerId;
        if (!customerId && params.clientId) {
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

        // 1. Extract External Resource ID (MP: data.id from query or body)
        // MP Webhook sends data.id in query params often for validation manifest
        // But for payload processing, we look at body.
        let resourceId = req.query?.['data.id'] || req.body?.data?.id || req.body?.id;

        if (!resourceId) {
            // Some events might not have data.id (e.g. test events). 
            // If we can't identify the resource, we can't find credentials (multitenant).
            // Attempt basic validation if adapter supports it without credentials (unlikely for HMAC)
            return { isValid: false, error: 'Missing resource ID' };
        }
        resourceId = resourceId.toString();

        // 2. Find Payment in DB to identify the Shop (and Credentials)
        const paymentRecord = await this.getPaymentByExternalId(resourceId);

        if (!paymentRecord) {
            console.warn(`[Orchestrator] Webhook received for unknown resource: ${resourceId}`);
            // Return 200 to gateway to stop retries if we really don't have it? 
            // Or maybe it's a delayed creation. For now, valid=true/status=ignore effectively ignores it.
            return { isValid: true, status: 'ignore', externalId: resourceId };
        }

        // 3. Get Credentials for the Shop
        const credentials = await this.getGatewayConfig(paymentRecord.barbershopId, gatewayName.toUpperCase());
        if (!credentials) {
            console.error(`[Orchestrator] No credentials found for shop ${paymentRecord.barbershopId}`);
            return { isValid: false, error: 'No credentials' };
        }

        // 4. Validate Webhook Signature (HMAC)
        // Now passing credentials which contain secretKey
        const isValid = await adapter.validateWebhook(req, credentials);
        if (!isValid) {
            console.error(`[Orchestrator] Invalid webhook signature for resource ${resourceId}`);
            return { isValid: false, error: 'Invalid signature' };
        }

        // 5. Process Status (Logic depends on Gateway)
        if (gateway === 'mercadopago') {
            // Use dedicated getPaymentStatus method
            const response = await adapter.getPaymentStatus({
                externalId: resourceId,
                credentials
            });

            return {
                isValid: true,
                externalId: resourceId,
                status: response.status,
                // Pass raw response if needed for more details
                // raw: response.rawResponse 
            };
        }

        return { isValid: true, externalId: resourceId, status: 'unknown' };
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
