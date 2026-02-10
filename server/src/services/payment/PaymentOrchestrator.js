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

        let gatewayToUse = 'mercadopago'; // Default

        // 1. Determine Context (Global vs Local)
        // If we are paying with a token, we need to know if it's a Global Token or Local Token
        // This is tricky because we just have the token string usually.
        // However, the caller (PaymentController) typically resolves the CardToken entity.
        // For this method, we might just need to rely on the passed configuration?
        // NO, if it's a global card, we MUST use global credentials.

        // Strategy: We will perform a check on the customerId if provided.
        // If the customerId matches a Global Customer record, we switch to Global Credentials.

        let useGlobalCredentials = false;
        let effectiveBarbershopId = barbershopId;
        let customerId = params.customerId;
        let token = params.token;

        if (token && !customerId && params.clientId) {
            // Attempt resolving customer from card usage
            // This is handled partly below but we need strict logic here.
            // Let's rely on finding the GatewayCustomer record.
        }

        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        // If paying with saved card (token provided)
        if (token && params.clientId) {
            // Try finding Global Customer first (preferred for Global Wallet)
            const globalGc = await prisma.gatewayCustomer.findUnique({
                where: {
                    clientId_gateway_barbershopId: {
                        clientId: params.clientId,
                        gateway: gatewayToUse.toUpperCase(),
                        barbershopId: 'GLOBAL' // We use specific string or NULL? Schema allows NULL.
                        // Ideally NULL for global. But Prisma unique constraints with NULL can be tricky depending on DB.
                        // PostgreSQL treats NULLs as distinct for unique indexes unless specified otherwise (in newer versions).
                        // Let's assume for now we search where barbershopId is null.
                    }
                }
            });

            // However, `authorized` checks below might fail if we don't know WHICH card is being used.
            // The frontend should ideally tell us if it's a global card or not.
            // Or the PaymentController resolves it.
            // Assuming PaymentController passes the correct context? 
            // Actually, `createCardPayment` in controller just has `token`.

            // If the token matches a Global CardToken in DB, we use Global Creds.
            const cardRecord = await prisma.cardToken.findFirst({
                where: { token: token, clientId: params.clientId }
            });

            if (cardRecord && !cardRecord.barbershopId) {
                // It is a Global Card
                useGlobalCredentials = true;
                effectiveBarbershopId = null; // Force global config
                console.log(`[Orchestrator] Detected Global Card usage. Switching to Platform Credentials.`);
            }
        }

        // If explicitly requested global (e.g. subscription to platform)
        if (!barbershopId) {
            useGlobalCredentials = true;
        }

        const adapter = this.gateways[gatewayToUse];
        if (!adapter) throw new Error(`Gateway '${gatewayToUse}' not supported.`);

        console.log(`[Orchestrator] Creating ${method} via ${gatewayToUse} for Shop ${barbershopId || 'GLOBAL'}`);


        // Get credentials
        // If useGlobalCredentials is true, getGatewayConfig(null) returned platform creds
        const credentials = await this.getGatewayConfig(effectiveBarbershopId, gatewayToUse);

        // Resolve Customer ID for the target context
        if (!customerId && params.clientId) {
            // Try finding customer for this specific context (Local or Global)
            // Note: If useGlobalCredentials is true, we look for barbershopId = null

            // We need to query manually because the unique constraint might handle NULL differently or we just want to be explicit
            const whereClause = {
                clientId: params.clientId,
                gateway: gatewayToUse.toUpperCase(),
                barbershopId: effectiveBarbershopId // matches null if global
            };

            // Prisma `findFirst` is safer for nullable fields in where
            const gc = await prisma.gatewayCustomer.findFirst({
                where: whereClause
            });
            customerId = gc?.customerId;
        }

        // --- SPLIT CALCULATION (Only if using configured Shop credentials, not Global) ---
        // If Global, we are receiving the full amount on Platform.
        // We might implement a transfer later.
        let disbursements = [];
        if (!useGlobalCredentials && params.appointmentId && gatewayToUse === 'mercadopago') {
            try {
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
            checkoutUrl: result.checkoutUrl || null,
            ticketUrl: result.ticketUrl || result.external_resource_url || null, // For boleto
            statusDetail: result.status_detail || null
        };
    }

    async saveCard({ barbershopId, client, token }) {
        // Defaulting to MercadoPago
        const gatewayToUse = 'mercadopago';
        const adapter = this.gateways[gatewayToUse];

        if (!adapter || !adapter.saveCard) throw new Error(`Gateway '${gatewayToUse}' does not support saving cards.`);

        // Get credentials (will handle null ID -> Platform creds)
        const credentials = await this.getGatewayConfig(barbershopId, gatewayToUse);

        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        // 1. Ensure Customer Exists in Gateway (Scoped to context)
        // Find existing for this scope
        let gatewayCustomer = await prisma.gatewayCustomer.findFirst({
            where: {
                clientId: client.id,
                gateway: gatewayToUse.toUpperCase(),
                barbershopId: barbershopId // strict match (null if null)
            }
        });

        let customerId = gatewayCustomer?.customerId;

        if (!customerId) {
            // Create Customer in Gateway
            console.log(`[Orchestrator] Creating Customer in ${gatewayToUse} for Client ${client.id} (Scope: ${barbershopId || 'GLOBAL'})`);
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
                    barbershopId: barbershopId // can be null
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

        // 3. Return Card Details
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

        let resourceId = req.query?.['data.id'] || req.body?.data?.id || req.body?.id;

        if (!resourceId) {
            return { isValid: false, error: 'Missing resource ID' };
        }
        resourceId = resourceId.toString();

        const paymentRecord = await this.getPaymentByExternalId(resourceId);

        let credentials;
        if (!paymentRecord) {
            console.warn(`[Orchestrator] Webhook for unknown resource ${resourceId}. Trying Validation with Platform Creds.`);
            // If payment not found, it might be a global subscription or orphan. Try Platform Creds as fallback?
            // Or maybe we just return 200 OK to stop retries if we truly don't know it.
            // Let's try platform validation just in case.
            credentials = await this.getGatewayConfig(null, gatewayName.toUpperCase());
        } else {
            // 3. Get Credentials for the Shop (or Platform if null)
            credentials = await this.getGatewayConfig(paymentRecord.barbershopId, gatewayName.toUpperCase());
        }

        if (!credentials || !credentials.accessToken) { // Basic check
            console.error(`[Orchestrator] No credentials found for validation.`);
            // Return true-ish to stop massive retries if we can't do anything?
            return { isValid: false, error: 'No credentials' };
        }

        // 4. Validate Webhook Signature (HMAC)
        const isValid = await adapter.validateWebhook(req, credentials);
        if (!isValid) {
            console.error(`[Orchestrator] Invalid webhook signature for resource ${resourceId}`);
            return { isValid: false, error: 'Invalid signature' };
        }

        // 5. Process Status
        if (gateway === 'mercadopago') {
            if (req.body?.type === 'subscription_preapproval') {
                const response = await adapter.getSubscriptionStatus({
                    externalId: resourceId,
                    credentials
                });

                return {
                    isValid: true,
                    externalId: resourceId,
                    status: response.status,
                    isSubscription: true
                };
            }

            try {
                const response = await adapter.getPaymentStatus({
                    externalId: resourceId,
                    credentials
                });

                return {
                    isValid: true,
                    externalId: resourceId,
                    status: response.status,
                };
            } catch (err) {
                console.warn(`[Orchestrator] Payment status check failed for ${resourceId}: ${err.message}`);
                return { isValid: true, externalId: resourceId, status: 'unknown', error: err.message };
            }
        }

        return { isValid: true, externalId: resourceId, status: 'unknown' };
    }

    async getPaymentByExternalId(externalId) {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const payment = await prisma.payment.findFirst({
            where: { externalId }
        });
        if (payment) return payment;

        const subscription = await prisma.clientSubscription.findFirst({
            where: { externalId },
            include: {
                plan: { include: { barbershop: true } }
            }
        });

        if (subscription) {
            return {
                id: subscription.id,
                barbershopId: subscription.plan.barbershopId,
                externalId: subscription.externalId,
                type: 'SUBSCRIPTION'
            };
        }

        return null;
    }

    async getGatewayConfig(barbershopId, gatewayName) {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const crypto = require('../../utils/crypto');

        let credentials = {};

        if (!barbershopId) {
            // GLOBAL / PLATFORM CREDENTIALS
            // Retrieve from Environment Variables
            if (gatewayName.toUpperCase() === 'MERCADOPAGO') {
                credentials = {
                    publicKey: process.env.MP_PUBLIC_KEY,
                    accessToken: process.env.MP_ACCESS_TOKEN, // Critical for backend ops
                    clientSecret: process.env.MP_CLIENT_SECRET,
                    secretKey: process.env.MP_CLIENT_SECRET // mapping
                };
            }
            // Add other gateways if needed
        } else {
            // SHOP SPECIFIC
            const config = await prisma.gatewayConfig.findUnique({
                where: {
                    barbershopId_gateway: {
                        barbershopId,
                        gateway: gatewayName.toUpperCase()
                    }
                }
            });

            if (config && config.credentials) {
                credentials = { ...config.credentials };
                // Auto-decrypt
                const sensitiveFields = ['secretKey', 'accessToken', 'apiKey', 'clientSecret'];
                sensitiveFields.forEach(field => {
                    if (credentials[field]) {
                        const decrypted = crypto.decrypt(credentials[field]);
                        if (decrypted) credentials[field] = decrypted;
                    }
                });
            }
        }

        return credentials;
    }

    async getPublicKey(barbershopId) {
        const gateway = 'MERCADOPAGO';
        const credentials = await this.getGatewayConfig(barbershopId, gateway);
        return credentials?.publicKey || process.env.MP_PUBLIC_KEY;
    }
}

module.exports = new PaymentOrchestrator();

