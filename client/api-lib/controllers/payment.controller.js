const prisma = require('../lib/prisma');
const TransactionService = require('../services/TransactionService');
const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const PaymentService = require('../services/payment/PaymentService');

exports.createPayment = async (req, res) => {
    try {
        const { amount, method, description, gateway, barbershopId, appointmentId, orderId } = req.body;
        const userId = req.user.id;

        const enforceShopId = req.tenantId || req.user.barbershopId;
        if (enforceShopId && barbershopId && enforceShopId !== barbershopId) {
            if (req.user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ error: 'Acesso negado: Você não pode criar pagamentos para outra barbearia.' });
            }
        }

        const finalBarbershopId = barbershopId || enforceShopId;

        if (!amount || !method) {
            return res.status(400).json({ error: 'Amount and method are required' });
        }

        const result = await PaymentService.createPayment({
            amount,
            method,
            description,
            gateway,
            barbershopId: finalBarbershopId,
            userId: req.user.role !== 'CLIENT' ? userId : null,
            clientId: req.user.role === 'CLIENT' ? userId : null,
            appointmentId,
            orderId
        });

        return res.status(201).json(result);
    } catch (error) {
        console.error('Create Payment Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to create payment' });
    }
};

exports.createPixPayment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user.id;

        if (!appointmentId) {
            return res.status(400).json({ error: 'Appointment ID is required' });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                barbershop: true,
                service: true,
                client: { include: { authUser: true } }
            }
        });

        if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });

        const amount = Number(appointment.service.price);
        if (amount <= 0) return res.status(400).json({ error: 'Valor inválido para pagamento' });

        let customerData;
        if (req.user.role === 'CLIENT') {
            customerData = {
                name: appointment.client.name || 'Cliente',
                email: appointment.client.authUser?.email || appointment.client.email || 'email@naoinformado.com',
                phone: appointment.client.phone || '00000000000',
                document: (appointment.client.cpf || '').replace(/\D/g, ''),
                identification: {
                    type: 'CPF',
                    number: (appointment.client.cpf || '').replace(/\D/g, '')
                }
            };
        } else {
            const payerUser = await prisma.user.findUnique({
                where: { id: userId },
                include: { authUser: true }
            });

            const cpf = (payerUser?.cpf || payerUser?.document || '').replace(/\D/g, '');
            customerData = {
                name: payerUser?.name || appointment.client.name || 'Cliente',
                email: payerUser?.authUser?.email || payerUser?.email || appointment.client.authUser?.email || 'email@naoinformado.com',
                phone: payerUser?.phone || appointment.client.phone || '00000000000',
                document: cpf,
                identification: {
                    type: 'CPF',
                    number: cpf
                }
            };
        }

        const result = await PaymentService.createPayment({
            amount,
            method: 'PIX',
            description: `Agendamento #${appointment.id.slice(0, 8)} - ${appointment.service.name}`,
            barbershopId: appointment.barbershopId,
            userId: req.user.role !== 'CLIENT' ? userId : null,
            clientId: req.user.role === 'CLIENT' ? userId : null,
            appointmentId: appointment.id,
            customer: customerData
        });

        return res.status(201).json({
            ...result,
            checkoutUrl: `/checkout-pix?id=${result.id}`,
            barbershopName: appointment.barbershop.name
        });

    } catch (error) {
        console.error('Create Pix Error:', error);
        return res.status(500).json({ error: error.message || 'Erro ao gerar Pix' });
    }
};

exports.createCardPayment = async (req, res) => {
    try {
        const { appointmentId, token, issuerId, paymentMethodId, installments, payer, saveCard } = req.body;
        const userId = req.user.id;

        if (!appointmentId || !token) {
            return res.status(400).json({ error: 'Missing required data (appointmentId, token)' });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                barbershop: true,
                service: true,
                client: { include: { authUser: true } }
            }
        });

        if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });

        let effectiveToken = token;

        // 1. Save Card First if requested (prevents token reuse error)
        if (saveCard) {
            try {
                console.log(`[PaymentController] pre-saving card for client ${appointment.clientId}`);
                const savedCardData = await PaymentOrchestrator.saveCard({
                    barbershopId: appointment.barbershopId,
                    client: appointment.client,
                    token: token
                });

                await prisma.cardToken.create({
                    data: {
                        clientId: appointment.clientId,
                        gateway: savedCardData.gateway.toUpperCase(),
                        token: savedCardData.token, // This is the Card ID in MP (card_...)
                        last4: savedCardData.last4,
                        brand: savedCardData.brand,
                        expiryMonth: savedCardData.expiryMonth,
                        expiryYear: savedCardData.expiryYear,
                        barbershopId: appointment.barbershopId,
                        isDefault: false
                    }
                });

                // Update token to be the Card ID (for subsequent payment)
                effectiveToken = savedCardData.token;
            } catch (saveError) {
                console.error('[PaymentController] Failed to pre-save card:', saveError.message);
                // Fallback to original token for at least this payment
            }
        }

        // 2. Create Payment
        const result = await PaymentService.createPayment({
            amount: appointment.service.price,
            method: paymentMethodId?.includes('debit') ? 'DEBIT_CARD' : 'CREDIT_CARD',
            description: `Agendamento #${appointment.id.slice(0, 8)}`,
            barbershopId: appointment.barbershopId,
            userId: req.user.role !== 'CLIENT' ? userId : null,
            clientId: req.user.role === 'CLIENT' ? userId : null,
            appointmentId: appointment.id,
            token: effectiveToken,
            installments: installments || 1,
            paymentMethodId,
            customer: payer
        });

        return res.status(201).json(result);

    } catch (error) {
        console.error('Create Card Payment Error:', error);
        return res.status(500).json({ error: error.message || 'Erro interno ao processar cartão' });
    }
};

exports.createBrickPayment = async (req, res) => {
    try {
        const {
            transaction_amount,
            description,
            payment_method_id,
            payer,
            token,
            installments,
            issuer_id,
            barbershopId,
            appointmentId
        } = req.body;

        const enforceShopId = req.tenantId || req.user.barbershopId;
        if (enforceShopId && barbershopId && enforceShopId !== barbershopId) {
            if (req.user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ error: 'Acesso negado: Você não pode criar pagamentos para outra barbearia.' });
            }
        }
        const finalBarbershopId = barbershopId || enforceShopId;

        const type = req.body.payment_type_id || req.body.method;
        const mpMethod = payment_method_id?.toLowerCase() || '';
        
        const finalMethod = (type === 'pix' || mpMethod === 'pix') ? 'PIX' : 
                          (type === 'debit_card' || mpMethod.includes('deb')) ? 'DEBIT_CARD' : 'CREDIT_CARD';

        const result = await PaymentService.createPayment({
            amount: transaction_amount,
            method: finalMethod,
            description: description || 'Pagamento via Brick',
            barbershopId: finalBarbershopId,
            userId: req.user.role !== 'CLIENT' ? req.user.id : null,
            clientId: req.user.role === 'CLIENT' ? req.user.id : null,
            appointmentId,
            token,
            installments,
            issuerId: issuer_id,
            paymentMethodId: payment_method_id,
            customer: payer // No need to spread if we want to preserve everything
        });

        return res.status(201).json(result);

    } catch (error) {
        console.error('Create Brick Payment Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to process brick payment' });
    }
};

exports.getPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { barbershop: { select: { name: true, logoUrl: true } } } // Include context
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        let responseData = { ...payment };

        // Generate QR Code Base64 on-the-fly if missing but we have the payload
        if (!responseData.qrCodeBase64 && (payment.pixCopiaECola || payment.qrCode)) {
            try {
                const qrcode = require('qrcode');
                const pixString = payment.pixCopiaECola || payment.qrCode;
                // Generate Base64 Data URL
                const dataUrl = await qrcode.toDataURL(pixString);
                // Return just the base64 part for consistency with Mercado Pago's format
                responseData.qrCodeBase64 = dataUrl.split(',')[1];
            } catch (err) {
                console.error('Failed to generate QR on getStatus:', err);
            }
        }

        return res.json(responseData);
    } catch (error) {
        console.error('Get Payment Status Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.saveCard = async (req, res) => {
    try {
        const { token, barbershopId } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role; // 'CLIENT', 'ADMIN', 'BARBER'

        if (!token) {
            return res.status(400).json({ error: 'Missing required data (token)' });
        }

        // barbershopId is now OPTIONAL. If missing, it's a GLOBAL card.

        let client;

        // 1. Resolve Client Profile based on Role
        if (userRole === 'CLIENT') {
            client = await prisma.client.findUnique({ where: { id: userId } });
            if (!client) return res.status(404).json({ error: 'Perfil de cliente não encontrado.' });
        } else {
            // It's a Pro (Admin/Barber) acting as a client
            // Try link via AuthUser
            client = await prisma.client.findFirst({
                where: { authUserId: req.user.authUserId }
            });

            // If Pro doesn't have a Client profile yet, create one
            if (!client) {
                const userProfile = await prisma.user.findUnique({
                    where: { id: userId },
                    include: { authUser: true }
                });

                if (!userProfile) return res.status(404).json({ error: 'Perfil de usuário não encontrado.' });

                client = await prisma.client.create({
                    data: {
                        name: userProfile.name,
                        phone: userProfile.phone,
                        authUserId: userProfile.authUserId || undefined,
                        theme: 'dark'
                    }
                });
            }
        }

        // 2. Call Orchestrator
        try {
            const savedCardData = await PaymentOrchestrator.saveCard({
                barbershopId: barbershopId || null, // Explicit null if undefined
                client,
                token
            });

            // 3. Save CardToken in DB
            const cardToken = await prisma.cardToken.create({
                data: {
                    clientId: client.id,
                    gateway: savedCardData.gateway.toUpperCase(),
                    token: savedCardData.token, // MP Card ID
                    last4: savedCardData.last4,
                    brand: savedCardData.brand,
                    expiryMonth: savedCardData.expiryMonth,
                    expiryYear: savedCardData.expiryYear,
                    barbershopId: barbershopId || null, // Global if null
                    isDefault: false
                }
            });

            return res.status(201).json(cardToken);
        } catch (orchestratorError) {
            // Handle "Card already saved" or other MP errors gracefully?
            console.error('Orchestrator Save Error:', orchestratorError);
            return res.status(400).json({ error: orchestratorError.message || 'Falha ao salvar no gateway.' });
        }

    } catch (error) {
        console.error('Save Card Controller Error:', error);
        return res.status(500).json({ error: 'Falha interna ao salvar cartão: ' + error.message });
    }
};

exports.listCards = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { barbershopId } = req.query;

        // 1. Resolve Client
        let client;
        if (userRole === 'CLIENT') {
            client = await prisma.client.findUnique({ where: { id: userId } });
        } else {
            // Pro
            client = await prisma.client.findFirst({
                where: { authUserId: req.user.authUserId }
            });
        }

        if (!client) {
            return res.json([]); // No profile = no cards
        }

        // 2. Query Cards
        // Show cards for this specific shop OR Global cards (barbershopId: null)
        const where = {
            clientId: client.id,
            OR: [
                { barbershopId: null }, // Global Cards
            ]
        };

        if (barbershopId) {
            where.OR.push({ barbershopId: barbershopId });
        }

        const cards = await prisma.cardToken.findMany({
            where,
            include: {
                barbershop: { select: { name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Transform
        const sanitized = cards.map(c => ({
            id: c.id,
            brand: c.brand,
            last4: c.last4,
            expiry: (c.expiryMonth && c.expiryYear) ? `${String(c.expiryMonth).padStart(2, '0')}/${c.expiryYear}` : null,
            barbershopName: c.barbershop?.name || 'Carteira Global',
            isGlobal: !c.barbershopId,
            barbershopId: c.barbershopId,
            isDefault: c.isDefault
        }));

        return res.json(sanitized);

    } catch (error) {
        console.error('List Cards Error:', error);
        return res.status(500).json({ error: 'Erro ao listar cartões' });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. Resolve Client
        let client;
        if (userRole === 'CLIENT') {
            client = await prisma.client.findUnique({ where: { id: userId } });
        } else {
            client = await prisma.client.findFirst({
                where: { authUserId: req.user.authUserId }
            });
        }

        if (!client) return res.status(404).json({ error: 'Perfil de cliente não encontrado' });

        // 2. Delete Card (Ensure it belongs to this client)
        const result = await prisma.cardToken.deleteMany({
            where: {
                id: id,
                clientId: client.id
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Cartão não encontrado ou não pertence a você' });
        }

        return res.json({ message: 'Cartão removido com sucesso' });

    } catch (error) {
        console.error('Delete Card Error:', error);
        return res.status(500).json({ error: 'Erro ao remover cartão' });
    }
};

exports.getPublicKey = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        // If no barbershopId, we return Platform Public Key

        // We can just ask Orchestrator. It handles null ID.
        const publicKey = await PaymentOrchestrator.getPublicKey(barbershopId || null);

        if (!publicKey) {
            return res.status(404).json({ error: 'Chave pública não encontrada' });
        }

        return res.json({
            gateway: 'MERCADOPAGO', // Default
            publicKey: publicKey
        });

    } catch (error) {
        console.error('Get Public Key Error:', error);
        return res.status(500).json({ error: 'Erro ao buscar chave pública' });
    }
};

// --- Stripe (cartão via PaymentIntents) ---
// Fluxo: intent (cria PI + Payment local) -> frontend confirma com Stripe.js
// -> confirm (re-consulta a API da Stripe e libera o agendamento).

exports.createStripeIntent = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        if (!appointmentId) return res.status(400).json({ error: 'appointmentId é obrigatório' });

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { client: { include: { authUser: true } }, service: true, barbershop: true }
        });
        if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });

        const amount = Number(appointment.service.price);
        if (amount <= 0) return res.status(400).json({ error: 'Valor inválido para pagamento' });

        // Stripe precisa estar ATIVA para esta barbearia
        const config = await prisma.gatewayConfig.findUnique({
            where: { barbershopId_gateway: { barbershopId: appointment.barbershopId, gateway: 'STRIPE' } }
        });
        if (!config?.isActive) {
            return res.status(400).json({ error: 'Stripe não está ativa nesta barbearia.' });
        }

        const credentials = await PaymentOrchestrator.getGatewayConfig(appointment.barbershopId, 'STRIPE');
        if (!credentials?.secretKey || !credentials?.publicKey) {
            return res.status(400).json({ error: 'Credenciais Stripe incompletas. Verifique as chaves em Configurações → Pagamentos.' });
        }

        // Registro local antes da chamada externa (trilha de auditoria)
        const pendingPayment = await prisma.payment.create({
            data: {
                gateway: 'stripe',
                method: 'CREDIT_CARD',
                status: 'pending',
                amount,
                clientId: req.user.role === 'CLIENT' ? req.user.id : null,
                userId: req.user.role !== 'CLIENT' ? req.user.id : null,
                appointmentId: appointment.id,
                barbershopId: appointment.barbershopId
            }
        });

        const adapter = PaymentOrchestrator.gateways.stripe;
        const intent = await adapter.createPayment({
            amount,
            currency: credentials.currency || 'brl',
            description: `Agendamento #${appointment.id.slice(0, 8)} - ${appointment.service.name}`,
            customer: { email: appointment.client?.authUser?.email || appointment.client?.email },
            credentials,
            metadata: { appointmentId: appointment.id, paymentId: pendingPayment.id }
        });

        await prisma.payment.update({
            where: { id: pendingPayment.id },
            data: { externalId: intent.externalId }
        });

        return res.status(201).json({
            paymentId: pendingPayment.id,
            clientSecret: intent.clientSecret,
            publishableKey: credentials.publicKey,
            amount
        });
    } catch (error) {
        console.error('Create Stripe Intent Error:', error);
        return res.status(500).json({ error: error.message || 'Erro ao iniciar pagamento Stripe' });
    }
};

exports.confirmStripePayment = async (req, res) => {
    try {
        const { paymentId } = req.body;
        if (!paymentId) return res.status(400).json({ error: 'paymentId é obrigatório' });

        const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment || payment.gateway !== 'stripe' || !payment.externalId) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }
        // Só o dono do pagamento pode confirmá-lo
        if (req.user.role === 'CLIENT' && payment.clientId !== req.user.id) {
            return res.status(403).json({ error: 'Não autorizado' });
        }

        const credentials = await PaymentOrchestrator.getGatewayConfig(payment.barbershopId, 'STRIPE');
        const adapter = PaymentOrchestrator.gateways.stripe;

        // Fonte da verdade: a API da Stripe (nunca o que o frontend afirma)
        const statusData = await adapter.getPaymentStatus({ externalId: payment.externalId, credentials });

        if (statusData.status === 'paid' && payment.status !== 'paid') {
            const updated = await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'paid', paidAt: new Date(), statusDetail: 'stripe_confirmed' }
            });
            await PaymentService.handlePaymentApproval(updated);
        } else if (statusData.status === 'failed' && payment.status !== 'failed') {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'failed', statusDetail: statusData.statusDetail || 'stripe_failed' }
            });
        }

        return res.json({ status: statusData.status, statusDetail: statusData.statusDetail });
    } catch (error) {
        console.error('Confirm Stripe Payment Error:', error);
        return res.status(500).json({ error: error.message || 'Erro ao confirmar pagamento Stripe' });
    }
};
