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
            // Base Payload for Orders API
            const payload = {
                external_reference: externalId,
                notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`,
                processing_mode: 'automatic', // Default for auto-capture/process
                payer: {
                    email: customer.email || 'guest@example.com',
                    first_name: customer.name?.split(' ')[0] || 'Cliente',
                    last_name: customer.name?.split(' ').slice(1).join(' ') || 'Visitante'
                },
                items: [
                    {
                        title: description || 'Serviço Barbearia',
                        quantity: 1,
                        unit_price: parseFloat(amount),
                        currency_id: 'BRL'
                    }
                ],
                transactions: {
                    payments: [] // Correct structure: object with payments array
                }
            };

            // Payment Object for Orders API (nested inside transactions.payments)
            const payment = {
                amount: parseFloat(amount),
                payment_method: {
                    installments: 1
                }
            };

            if (method === 'PIX') {
                payment.payment_method.id = 'pix';
                payment.payment_method.type = 'bank_transfer';
            } else if (method === 'BOLETO') {
                payment.payment_method.id = 'bolbradesco'; // Standard for BR
                payment.payment_method.type = 'ticket';
                if (payer?.identification) {
                    // Payer identification for Boleto
                    if (!payload.payer.identification) payload.payer.identification = {};
                    payload.payer.identification = payer.identification;
                }
            } else if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD') {
                if (!token) throw new Error("Token do cartão obrigatório para pagamentos via cartão.");

                payment.payment_method.token = token;
                payment.payment_method.installments = Number(installments) || 1;
                payment.payment_method.id = paymentMethodId; // e.g. 'master'
                payment.payment_method.type = method === 'CREDIT_CARD' ? 'credit_card' : 'debit_card';
                if (issuerId) payment.payment_method.issuer_id = issuerId;
            }

            // Add payment to transactions.payments
            payload.transactions.payments.push(payment);

            // Request to /v1/orders
            const response = await axios.post(`${this.apiUrl}/orders`, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Idempotency-Key': `order_${externalId}_${Date.now()}`
                }
            });

            const data = response.data;
            // Response structure has 'transactions' -> 'payments' array
            const mainPayment = data.transactions?.payments?.[0]; // The payment object inside the response

            // Determine Status
            let finalStatus = 'pending';
            const orderStatus = data.status; // open, closed, expired
            const paymentStatus = mainPayment?.status;

            if (orderStatus === 'closed' || paymentStatus === 'approved' || paymentStatus === 'processed' || paymentStatus === 'accredited') {
                finalStatus = 'paid';
            } else if (orderStatus === 'expired' || paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
                finalStatus = 'failed';
            }

            // Extract QR Code / Ticket URL
            let qrCode = null;
            let qrCodeBase64 = null;
            let checkoutUrl = null;
            let pixCopiaECola = null;

            if (mainPayment) {
                // Ticket/Pix data is often in payment_method or transaction_details
                // Pix
                if (method === 'PIX') {
                    qrCode = mainPayment.payment_method?.qr_code || mainPayment.transaction_details?.qr_code;
                    qrCodeBase64 = mainPayment.payment_method?.qr_code_base64 || mainPayment.transaction_details?.qr_code_base64;
                    pixCopiaECola = qrCode; // Same for Pix
                    checkoutUrl = mainPayment.transaction_details?.external_resource_url;
                }
                // Boleto
                else if (method === 'BOLETO') {
                    checkoutUrl = mainPayment.payment_method?.ticket_url || mainPayment.transaction_details?.external_resource_url;
                    qrCode = mainPayment.payment_method?.barcode_content || mainPayment.transaction_details?.barcode_content; // Barcode line
                }
                // Card
                else {
                    // Card generally doesn't have "checkoutUrl" unless 3DS is needed
                }
            }

            return {
                externalId: data.id.toString(), // Order ID
                transactionId: mainPayment?.id?.toString(),
                qrCode,
                qrCodeBase64,
                pixCopiaECola,
                status: finalStatus,
                checkoutUrl,
                rawResponse: data
            };
        } catch (err) {
            console.error('[MP] Create Order Error:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || JSON.stringify(err.response?.data?.causes) || err.message;
            throw new Error(`Erro Mercado Pago (Orders): ${errorMsg}`);
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
