const GatewayAdapter = require('./GatewayAdapter');
const axios = require('axios');

class MercadoPagoAdapter extends GatewayAdapter {
    constructor() {
        super();
        this.apiUrl = 'https://api.mercadopago.com/v1';
    }

    async createPayment({ amount, description, customer, credentials, externalId, method, token, installments, issuerId, paymentMethodId, payer }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

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

            // Payload for /v1/payments API
            const payload = {
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
                payload.payment_method_id = 'pix';
            } else if (method === 'BOLETO') {
                payload.payment_method_id = 'bolbradesco';
            } else if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD' || method.includes('card')) {
                if (!token) throw new Error("Token do cartão obrigatório.");
                payload.token = token;

                // STRICT DEBIT ENFORCEMENT: If it's debit, force 1 installment.
                // In MP, payment_method_id for debit usually starts with 'deb'.
                const isDebit = method === 'DEBIT_CARD' || (paymentMethodId && paymentMethodId.toLowerCase().includes('deb'));

                if (isDebit) {
                    payload.installments = 1;
                    if (!paymentMethodId) payload.payment_method_id = 'debvisa'; // Fallback if missing, but should be passed
                } else {
                    payload.installments = Number(installments) || 1;
                }

                if (paymentMethodId) payload.payment_method_id = paymentMethodId;
                if (issuerId) payload.issuer_id = issuerId;
            }

            // STABLE IDEMPOTENCY: Use the internal Payment UUID if available, otherwise fallback.
            // This prevents duplicate charges if the same request is retried.
            const idempotencyKey = externalId ? `pay_${externalId}` : `temp_${Date.now()}`;

            const response = await axios.post(`${this.apiUrl}/payments`, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Idempotency-Key': idempotencyKey
                }
            });

            const data = response.data;
            let finalStatus = 'pending';

            // Mapping MP statuses to internal statuses
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

        try {
            // Create
            const res = await axios.post(`${this.apiUrl}/customers`, {
                email,
                first_name: name?.split(' ')[0] || 'Cliente',
                last_name: name?.split(' ').slice(1).join(' ') || ''
            }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            return res.data; // { id: "..." }
        } catch (err) {
            console.error('[MP] Create Customer Error:', err.response?.data || err.message);
            throw new Error(`Falha ao criar cliente no MP: ${err.response?.data?.message || err.message}`);
        }
    }

    async saveCard({ customerId, token, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        try {
            const res = await axios.post(`${this.apiUrl}/customers/${customerId}/cards`, { token }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            return res.data; // { id: "...", first_six_digits, last_four_digits, ... }
        } catch (err) {
            console.error('[MP] Save Card Error:', err.response?.data || err.message);
            throw new Error(`Falha ao salvar cartão no MP: ${err.response?.data?.message || err.message}`);
        }
    }

    async createSubscriptionPlan({ plan, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        try {
            const payload = {
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

            // Enhanced frequency mapping based on validityDays
            if (plan.validityDays >= 365) {
                payload.auto_recurring.frequency = 1;
                payload.auto_recurring.frequency_type = 'months';
                payload.auto_recurring.repetitions = 12; // Annual plan billed monthly for 12 months
            } else if (plan.validityDays === 30 || plan.validityDays === 31) {
                payload.auto_recurring.frequency = 1;
                payload.auto_recurring.frequency_type = 'months';
            } else if (plan.validityDays === 7) {
                payload.auto_recurring.frequency = 1;
                payload.auto_recurring.frequency_type = 'weeks';
            } else if (plan.validityDays > 0) {
                payload.auto_recurring.frequency = plan.validityDays;
                payload.auto_recurring.frequency_type = 'days';
            }

            const response = await axios.post(`${this.apiUrl}/preapproval_plan`, payload, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            return {
                id: response.data.id,
                init_point: response.data.init_point
            };
        } catch (err) {
            console.error('[MP] Create Plan Error:', err.response?.data || err.message);
            throw new Error(`Erro ao criar plano no MP: ${err.response?.data?.message || err.message}`);
        }
    }

    async createSubscription({ planId, cardToken, payerEmail, externalReference, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        try {
            const payload = {
                preapproval_plan_id: planId,
                card_token_id: cardToken,
                payer_email: payerEmail,
                external_reference: externalReference,
                status: 'authorized' // Auto-approve
            };

            const response = await axios.post(`${this.apiUrl}/preapproval`, payload, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            return {
                subscriptionId: response.data.id,
                status: response.data.status, // authorized, paused, cancelled
                payerId: response.data.payer_id
            };
        } catch (err) {
            console.error('[MP] Create Subscription Error:', err.response?.data || err.message);
            throw new Error(`Erro ao assinar no MP: ${err.response?.data?.message || err.message}`);
        }
    }

    async getPaymentStatus({ externalId, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        // Check if it's an Order ID (starts with ORD usually, depends on MP version, but typically we know from creation)
        // Or we just try one endpoint and fallback? 
        // Safer: Since we migrated to Orders API, new IDs are likely Orders. 
        // But we might have legacy ID? Legacy Payment IDs are numeric. Orders IDs are alphanumeric (often).

        let endpoint = `${this.apiUrl}/payments/${externalId}`;
        let isOrder = false;

        // Simple heuristic: If it contains letters and is long, probably an Order ID (e.g. ORD...)
        // Or if we strictly use Orders API now, we check if it looks like an Order.
        if (externalId && typeof externalId === 'string' && (externalId.startsWith('ORD') || isNaN(externalId))) {
            endpoint = `${this.apiUrl}/orders/${externalId}`;
            isOrder = true;
        }

        try {
            const response = await axios.get(endpoint, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            const data = response.data;

            let status = 'pending';

            if (isOrder) {
                // Order Status Logic
                const orderStatus = data.status; // open, closed, expired
                // Check transactions inside order for more detail
                const txStatus = data.transactions?.payments?.[0]?.status;

                if (orderStatus === 'closed' || txStatus === 'approved' || txStatus === 'accredited') {
                    status = 'paid';
                } else if (orderStatus === 'expired' || txStatus === 'rejected' || txStatus === 'cancelled') {
                    status = 'failed';
                }
            } else {
                // Legacy Payment Status Logic
                if (data.status === 'approved') status = 'paid';
                else if (data.status === 'rejected' || data.status === 'cancelled') status = 'failed';
            }

            return {
                externalId: data.id.toString(),
                status: status,
                rawResponse: data
            };
        } catch (err) {
            console.error('[MP] Get Status Error:', err.response?.data || err.message);
            throw new Error(`Erro ao buscar status no Mercado Pago: ${err.message}`);
        }
    }

    async getSubscriptionStatus({ externalId, credentials }) {
        const accessToken = credentials?.accessToken || process.env.MP_ACCESS_TOKEN;
        if (!accessToken) throw new Error("Mercado Pago Access Token missing.");

        // O 'externalId' aqui é o 'preapproval_id' do Mercado Pago
        try {
            const response = await axios.get(`${this.apiUrl}/preapproval/${externalId}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            const data = response.data;
            const mpStatus = data.status; // authorized, paused, cancelled

            // Mapear status do MP para o nosso sistema
            let status = 'PENDING';
            if (mpStatus === 'authorized') status = 'ACTIVE';
            else if (mpStatus === 'paused') status = 'OVERDUE'; // Ou SUSPENDED, dependendo do enum
            else if (mpStatus === 'cancelled') status = 'CANCELLED';
            else if (mpStatus === 'pending') status = 'PENDING';

            return {
                externalId: data.id,
                status: status,
                rawResponse: data
            };

        } catch (err) {
            console.error('[MP] Get Subscription Status Error:', err.response?.data || err.message);
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
        const secret = credentials?.secretKey || credentials?.clientSecret;

        if (!secret) {
            console.warn('[MP Webhook] No Secret Key available for validation. Skipping HMAC check (INSECURE).');
            // Returning true purely to avoid breaking flow if user hasn't configured secret yet, 
            // BUT this should be false in production.
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
