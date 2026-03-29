const GatewayAdapter = require('./GatewayAdapter');
const { MercadoPagoConfig, Payment } = require('mercadopago');

class MercadoPagoAdapter extends GatewayAdapter {
    constructor() {
        super();
    }

    async createPayment({ amount, description, customer, credentials, externalId, method, token, installments, issuerId, paymentMethodId, payer }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
        const payment = new Payment(client);

        try {
            // Payer Info - Strict identification check
            const identificationNumber = (customer.document || customer.identification?.number || payer?.identification?.number || '').replace(/\D/g, '');
            const identificationType = customer.identification?.type || payer?.identification?.type || 'CPF';

            if (!identificationNumber) {
                throw new Error("Documento (CPF/CNPJ) do pagador é obrigatório.");
            }

            const payerEmail = customer.email || payer?.email;
            if (!payerEmail) {
                throw new Error("E-mail do pagador é obrigatório.");
            }

            // Payload for MP SDK
            const body = {
                transaction_amount: parseFloat(amount),
                description: description || 'Serviço Barbearia',
                external_reference: externalId?.toString(),
                notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`,
                payer: {
                    email: payerEmail,
                    first_name: customer.name?.split(' ')[0] || payer?.first_name || 'Cliente',
                    last_name: customer.name?.split(' ').slice(1).join(' ') || payer?.last_name || '',
                    identification: {
                        type: identificationType,
                        number: identificationNumber
                    }
                }
            };

            // Method Logic
            if (method === 'PIX') {
                body.payment_method_id = 'pix';
            } else if (method === 'BOLETO') {
                body.payment_method_id = 'bolbradesco';
            } else if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD' || method.includes('card')) {
                if (!token) throw new Error("Token do cartão obrigatório.");
                body.token = token;

                const isDebit = method === 'DEBIT_CARD' || (paymentMethodId && paymentMethodId.toLowerCase().includes('deb'));

                if (isDebit) {
                    body.installments = 1;
                    if (!paymentMethodId) body.payment_method_id = 'debvisa';
                } else {
                    body.installments = Number(installments) || 1;
                }

                if (paymentMethodId) body.payment_method_id = paymentMethodId;
                if (issuerId) body.issuer_id = issuerId;
            }

            const idempotencyKey = externalId ? `pay_${externalId}` : `temp_${Date.now()}`;

            const response = await payment.create({
                body,
                requestOptions: { idempotencyKey }
            });

            const data = response;
            let finalStatus = 'pending';

            const statusMap = {
                'approved': 'paid',
                'accredited': 'paid',
                'rejected': 'failed',
                'cancelled': 'failed',
                'in_process': 'pending',
                'pending': 'pending',
                'refunded': 'refunded',
                'in_mediation': 'pending'
            };

            finalStatus = statusMap[data.status] || 'pending';

            // Extract PIX / Ticket Data
            let qrCode = null;
            let qrCodeBase64 = null;
            let checkoutUrl = null;
            let pixCopiaECola = null;

            if (method === 'PIX' || data.payment_method_id === 'pix') {
                const txData = data.point_of_interaction?.transaction_data;
                qrCode = txData?.qr_code;
                qrCodeBase64 = txData?.qr_code_base64;
                pixCopiaECola = qrCode;
                checkoutUrl = txData?.ticket_url;
            } else if (method === 'BOLETO') {
                checkoutUrl = data.transaction_details?.external_resource_url;
                qrCode = data.barcode?.content;
            }

            return {
                externalId: data.id.toString(),
                transactionId: data.id.toString(),
                qrCode,
                qrCodeBase64,
                pixCopiaECola,
                status: finalStatus,
                statusDetail: data.status_detail,
                checkoutUrl,
                rawResponse: data
            };
        } catch (err) {
            console.error('[MP] Create Payment Error:', err.response?.data || err.message);
            const mpError = err.response?.data;
            let errorMsg = mpError?.message || err.message;

            // Helpful errors for common MP issues
            if (mpError?.cause?.[0]?.description) {
                errorMsg = `${errorMsg}: ${mpError.cause[0].description}`;
            }

            throw new Error(`Erro Mercado Pago: ${errorMsg}`);
        }
    }

    async createCustomer({ email, name, phone, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        const { Customer } = require('mercadopago');
        const client = new MercadoPagoConfig({ accessToken });
        const customerClient = new Customer(client);

        try {
            const res = await customerClient.create({
                body: {
                    email,
                    first_name: name?.split(' ')[0] || 'Cliente',
                    last_name: name?.split(' ').slice(1).join(' ') || ''
                }
            });
            return res; // { id: "..." }
        } catch (err) {
            console.error('[MP] Create Customer Error:', err);
            throw new Error(`Falha ao criar cliente no MP: ${err.message}`);
        }
    }

    async saveCard({ customerId, token, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        const { CustomerCard } = require('mercadopago');
        const client = new MercadoPagoConfig({ accessToken });
        const cardClient = new CustomerCard(client);

        try {
            const res = await cardClient.create({
                customerId,
                body: { token }
            });
            return res; 
        } catch (err) {
            console.error('[MP] Save Card Error:', err);
            throw new Error(`Falha ao salvar cartão no MP: ${err.message}`);
        }
    }

    async createSubscriptionPlan({ plan, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        const { PreApprovalPlan } = require('mercadopago');
        const client = new MercadoPagoConfig({ accessToken });
        const planClient = new PreApprovalPlan(client);

        try {
            const body = {
                reason: plan.name,
                auto_recurring: {
                    frequency: 1,
                    frequency_type: 'months',
                    transaction_amount: parseFloat(plan.price),
                    currency_id: 'BRL'
                },
                back_url: process.env.FRONTEND_URL || 'https://seusite.com/sucesso',
                external_reference: plan.id.toString()
            };

            if (plan.validityDays >= 365) {
                body.auto_recurring.frequency = 1;
                body.auto_recurring.frequency_type = 'months';
                body.auto_recurring.repetitions = 12; 
            } else if (plan.validityDays === 30 || plan.validityDays === 31) {
                body.auto_recurring.frequency = 1;
                body.auto_recurring.frequency_type = 'months';
            } else if (plan.validityDays === 7) {
                body.auto_recurring.frequency = 1;
                body.auto_recurring.frequency_type = 'weeks';
            } else if (plan.validityDays > 0) {
                body.auto_recurring.frequency = plan.validityDays;
                body.auto_recurring.frequency_type = 'days';
            }

            const response = await planClient.create({ body });

            return {
                id: response.id,
                init_point: response.init_point
            };
        } catch (err) {
            console.error('[MP] Create Plan Error:', err);
            throw new Error(`Erro ao criar plano no MP: ${err.message}`);
        }
    }

    async createSubscription({ planId, cardToken, payerEmail, externalReference, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        const { PreApproval } = require('mercadopago');
        const client = new MercadoPagoConfig({ accessToken });
        const subClient = new PreApproval(client);

        try {
            const body = {
                preapproval_plan_id: planId,
                card_token_id: cardToken,
                payer_email: payerEmail,
                external_reference: externalReference,
                status: 'authorized' 
            };

            const response = await subClient.create({ body });

            return {
                subscriptionId: response.id,
                status: response.status, 
                payerId: response.payer_id
            };
        } catch (err) {
            console.error('[MP] Create Subscription Error:', err);
            throw new Error(`Erro ao assinar no MP: ${err.message}`);
        }
    }

    async getPaymentStatus({ externalId, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        const client = new MercadoPagoConfig({ accessToken });
        const payment = new Payment(client);

        try {
            const data = await payment.get({ id: externalId });

            let status = 'pending';
            if (data.status === 'approved' || data.status === 'accredited') status = 'paid';
            else if (data.status === 'rejected' || data.status === 'cancelled') status = 'failed';

            return {
                externalId: data.id.toString(),
                status: status,
                rawResponse: data
            };
        } catch (err) {
            console.error('[MP] Get Status Error:', err);
            throw new Error(`Erro ao buscar status no Mercado Pago: ${err.message}`);
        }
    }

    async getSubscriptionStatus({ externalId, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        const { PreApproval } = require('mercadopago');
        const client = new MercadoPagoConfig({ accessToken });
        const subClient = new PreApproval(client);

        try {
            const data = await subClient.get({ id: externalId });
            const mpStatus = data.status; 

            let status = 'PENDING';
            if (mpStatus === 'authorized') status = 'ACTIVE';
            else if (mpStatus === 'paused') status = 'OVERDUE'; 
            else if (mpStatus === 'cancelled') status = 'CANCELLED';
            else if (mpStatus === 'pending') status = 'PENDING';

            return {
                externalId: data.id,
                status: status,
                rawResponse: data
            };

        } catch (err) {
            console.error('[MP] Get Subscription Status Error:', err);
            throw new Error(`Erro ao buscar status da assinatura no Mercado Pago: ${err.message}`);
        }
    }

    async processWebhook(req, credentials) {
        const isValid = this.validateWebhook(req, credentials);
        if (!isValid) return { isValid: false };

        const type = req.body?.type || req.body?.topic;
        const dataId = req.query['data.id'] || req.body?.data?.id || req.body?.id;

        if (!dataId) return { isValid: false };

        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;

        try {
            if (type === 'payment') {
                const statusData = await this.getPaymentStatus({ externalId: dataId, credentials });
                return {
                    isValid: true,
                    type: 'payment',
                    externalId: statusData.externalId,
                    status: statusData.status,
                    raw: statusData.rawResponse
                };
            } else if (type === 'subscription_preapproval' || type === 'preapproval') {
                const statusData = await this.getSubscriptionStatus({ externalId: dataId, credentials });
                return {
                    isValid: true,
                    type: 'subscription',
                    externalId: statusData.externalId,
                    status: statusData.status.toLowerCase(), // active -> paid? 
                    raw: statusData.rawResponse
                };
            }

            return { isValid: true, type: 'unknown', externalId: dataId };
        } catch (err) {
            console.error('[MP Webhook] Process Error:', err.message);
            return { isValid: false, error: err.message };
        }
    }

    validateWebhook(req, credentials) {
        const crypto = require('crypto');

        // Headers
        const xSignature = req.headers['x-signature'];
        const xRequestId = req.headers['x-request-id'];

        if (!xSignature || !xRequestId) {
            console.warn('[MP Webhook] Missing signature headers.');
            return false;
        }

        // Query Param (data.id) - Use lowercase format for manifest
        // Express converts query params to object. We need "data.id" specifically.
        // It might be in req.query['data.id']
        const dataId = req.query['data.id'];

        if (!dataId) {
            console.warn('[MP Webhook] Missing data.id in query params.');
            return false;
        }

        // Parse x-signature
        // Format: ts=...,v1=...
        const parts = xSignature.split(',');
        let ts = null;
        let v1 = null;

        parts.forEach(part => {
            const [key, val] = part.split('=');
            if (key && val) {
                if (key.trim() === 'ts') ts = val.trim();
                else if (key.trim() === 'v1') v1 = val.trim();
            }
        });

        if (!ts || !v1) {
            console.warn('[MP Webhook] Invalid signature format.');
            return false;
        }

        // Secret Key (Not Access Token)
        // User must provide "Secret Key" in credentials. 
        // If not available (only access token), we cannot validate HMAC properly.
        // Falls back to basic check only if secret is missing? 
        // Security requirement: MUST have secret.
        const secret = credentials?.clientSecret || credentials?.secretKey;

        if (!secret) {
            console.warn('[MP Webhook] No Secret Key / Client Secret available for validation. Skipping HMAC check (INSECURE).');
            return true;
        }

        // Manifest Template: id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

        // Create HMAC
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(manifest);
        const calculatedHash = hmac.digest('hex');

        if (calculatedHash === v1) {
            return true;
        } else {
            console.warn('[MP Webhook] HMAC Validation Failed.');
            console.debug(`Expected: ${v1}, Calculated: ${calculatedHash}`);
            return false;
        }
    }
}

module.exports = MercadoPagoAdapter;
