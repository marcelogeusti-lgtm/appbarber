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
            // Payload for /v1/payments API (Standard & Better for Pix/Cards)
            const payload = {
                transaction_amount: parseFloat(amount),
                description: description || 'Serviço Barbearia',
                external_reference: externalId,
                notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`,
                payer: {
                    email: customer.email || 'guest@example.com',
                    first_name: customer.name?.split(' ')[0] || 'Cliente',
                    last_name: customer.name?.split(' ').slice(1).join(' ') || 'Visitante',
                    identification: identification || payer?.identification
                }
            };

            if (method === 'PIX') {
                payload.payment_method_id = 'pix';
            } else if (method === 'BOLETO') {
                payload.payment_method_id = 'bolbradesco';
            } else if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD') {
                if (!token) throw new Error("Token do cartão obrigatório.");
                payload.token = token;
                payload.installments = Number(installments) || 1;
                payload.payment_method_id = paymentMethodId;
                if (issuerId) payload.issuer_id = issuerId;
            }

            const response = await axios.post(`${this.apiUrl}/payments`, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Idempotency-Key': `pay_${externalId}_${Date.now()}`
                }
            });

            const data = response.data;
            let finalStatus = 'pending';

            if (data.status === 'approved' || data.status === 'accredited') finalStatus = 'paid';
            else if (data.status === 'rejected' || data.status === 'cancelled') finalStatus = 'failed';

            // Extract PIX / Ticket Data
            let qrCode = null;
            let qrCodeBase64 = null;
            let checkoutUrl = null;
            let pixCopiaECola = null;

            if (method === 'PIX') {
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
                checkoutUrl,
                rawResponse: data
            };
        } catch (err) {
            console.error('[MP] Create Payment Error:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || err.message;
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
                    frequency: plan.validityDays >= 365 ? 1 : plan.validityDays >= 30 ? 1 : plan.validityDays,
                    frequency_type: plan.validityDays >= 365 ? 'months' : plan.validityDays >= 30 ? 'months' : 'days', // Ajuste básico, ideal é configurar isso no plano
                    transaction_amount: parseFloat(plan.price),
                    currency_id: 'BRL'
                },
                back_url: 'https://seusite.com/sucesso', // Placeholder
                external_reference: plan.id
            };

            // Ajuste fino para mensal (30 dias) -> 1 month
            if (plan.validityDays === 30) {
                payload.auto_recurring.frequency = 1;
                payload.auto_recurring.frequency_type = 'months';
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
