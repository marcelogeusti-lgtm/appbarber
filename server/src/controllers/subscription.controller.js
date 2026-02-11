const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const { resetMonthlySubscriptions } = require('../workers/worker.subscription');

// --- Barber/Shop Admin Actions ---

exports.createPlan = async (req, res) => {
    try {
        let { name, description, benefits, price, validityDays, barbershopId, quantityOfCuts, allowedMethods } = req.body;

        if (!name || price === undefined || price === null || !barbershopId) {
            return res.status(400).json({ message: 'Nome, preço e barbearia são obrigatórios.' });
        }

        const priceNumber = parseFloat(price);
        if (isNaN(priceNumber)) {
            return res.status(400).json({ message: 'O preço deve ser um número válido.' });
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name,
                description,
                benefits: Array.isArray(benefits) ? benefits : [],
                price: priceNumber,
                validityDays: parseInt(validityDays) || 30,
                quantityOfCuts: parseInt(quantityOfCuts) || 0,
                barbershopId,
                allowedMethods: allowedMethods || ['PIX', 'CREDIT_CARD'],
                active: true
            }
        });

        console.log('[Subscription] Plan created successfully:', plan.id);
        res.status(201).json(plan);
    } catch (error) {
        console.error('Create Plan Error Details:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Erro ao criar plano de assinatura.',
            error: error.message,
            code: error.code
        });
    }
};

exports.getPlans = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const plans = await prisma.subscriptionPlan.findMany({
            where: { barbershopId, active: true },
            orderBy: { price: 'asc' }
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar planos.' });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        // Instead of hard delete, we often deactivate to keep history
        await prisma.subscriptionPlan.update({
            where: { id },
            data: { active: false }
        });
        res.json({ message: 'Plano desativado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover plano.' });
    }
};

exports.getSubscribers = async (req, res) => {
    try {
        const barbershopId = req.user.barbershopId || req.user.workedBarbershopId;

        const subscribers = await prisma.clientSubscription.findMany({
            where: { plan: { barbershopId } },
            include: {
                client: true,
                plan: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(subscribers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar assinantes.' });
    }
};

// --- Client / Purchase Actions ---

exports.getMyActiveSubscription = async (req, res) => {
    try {
        // Find corresponding client for the user
        const client = await prisma.client.findUnique({
            where: { authUserId: req.user.id }
        });

        if (!client) return res.json(null);

        const sub = await prisma.clientSubscription.findFirst({
            where: {
                clientId: client.id,
                status: 'ACTIVE',
                endDate: { gte: new Date() }
            },
            include: { plan: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(sub);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar assinatura ativa.' });
    }
};

exports.subscribe = async (req, res) => {
    try {
        const { planId, cardId } = req.body;
        const authUserId = req.user.id;

        if (!planId || !cardId) {
            return res.status(400).json({ message: 'Plano e Cartão são obrigatórios.' });
        }

        // 1. Fetch Plan & Shop Context
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
            include: { barbershop: { include: { gatewayConfigs: true } } }
        });
        if (!plan) return res.status(404).json({ message: 'Plano não encontrado.' });

        // 2. Fetch Client
        const client = await prisma.client.findUnique({ where: { authUserId } });
        if (!client) return res.status(404).json({ message: 'Perfil de cliente não encontrado.' });

        // 3. Fetch Saved CardToken
        const cardTokenRecord = await prisma.cardToken.findUnique({
            where: { id: cardId }
        });

        if (!cardTokenRecord) {
            return res.status(404).json({ message: 'Cartão não encontrado.' });
        }

        // Validate Ownership
        if (cardTokenRecord.clientId !== client.id) {
            return res.status(403).json({ message: 'Cartão inválido para este usuário.' });
        }

        // 4. Process Payment (Charge First Month) via PaymentOrchestrator
        // Note: usage of 'token' here is the saved Card ID (card_...)
        console.log(`[Subscription] Charging saved card ${cardId} for Plan ${plan.name} (${plan.price})`);

        const paymentResult = await PaymentOrchestrator.createPayment({
            method: 'credit_card',
            barbershopId: plan.barbershopId,
            clientId: client.id,
            amount: Number(plan.price),
            description: `Assinatura: ${plan.name} (Mensal)`,
            token: cardTokenRecord.token, // This is the 'card_...' ID from MP
            installments: 1,
            // customerId: cardTokenRecord.customerId (if we stored it, else Orchestrator finds it)
        });

        if (paymentResult.status !== 'approved' && paymentResult.status !== 'process_payment' && paymentResult.status !== 'paid') {
            // Note: MP 'status' is usually 'approved'. 'paid' is our internal map?
            // Let's check typical MP response. Orchestrator returns Normalized Status.
            // If it's pending (review) we might allow but warn. If rejected, stop.
            if (paymentResult.status === 'rejected' || paymentResult.status === 'cancelled') {
                return res.status(400).json({ message: 'Pagamento recusado. Tente outro cartão.' });
            }
        }

        // 5. Create Active Subscription
        const now = new Date();
        const nextBilling = new Date();
        nextBilling.setDate(now.getDate() + 30); // 30 Days Cycle default

        // Deactivate previous active subs for this shop/plan logic if needed?
        // Usually yes, one active sub per shop? Or per plan? Let's assume per Shop for now to avoid stacking.
        await prisma.clientSubscription.updateMany({
            where: {
                clientId: client.id,
                plan: { barbershopId: plan.barbershopId },
                status: 'ACTIVE'
            },
            data: { status: 'CANCELLED' }
        });

        const newSub = await prisma.clientSubscription.create({
            data: {
                clientId: client.id,
                planId: plan.id,
                status: 'ACTIVE',
                startDate: now,
                endDate: nextBilling, // Valid until next billing
                nextBillingDate: nextBilling,
                paymentMethod: 'CREDIT_CARD',
                remainingCuts: plan.quantityOfCuts,
                externalId: paymentResult.paymentId // Link to initial payment for reference
            }
        });

        res.status(201).json({
            subscription: newSub,
            message: 'Assinatura realizada com sucesso!'
        });

    } catch (error) {
        console.error('Direct Subscribe Error:', error);
        res.status(500).json({
            message: 'Erro ao processar assinatura.',
            details: error.message
        });
    }
};

exports.purchasePlan = async (req, res) => {
    try {
        const { planId, paymentMethod, gateway, token, payer, cardToken } = req.body;
        const authUserId = req.user.id;

        // 1. Validate Input
        const effectiveCardToken = token || cardToken;
        if (!effectiveCardToken) {
            return res.status(400).json({ message: 'Token do cartão é obrigatório para assinar.' });
        }

        // 2. Fetch Plan & Shop Context
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
            include: { barbershop: { include: { gatewayConfigs: true } } }
        });
        if (!plan) return res.status(404).json({ message: 'Plano não encontrado.' });

        // 3. Ensure Client Profile Exists
        let client = await prisma.client.findUnique({ where: { authUserId } });
        if (!client) {
            console.log(`[Subscription] Client profile missing for user ${authUserId}. Creating one...`);
            const authUser = await prisma.authUser.findUnique({ where: { id: authUserId }, include: { user: true } });
            client = await prisma.client.create({
                data: {
                    authUserId,
                    name: authUser?.user?.name || authUser?.email?.split('@')[0] || 'Cliente',
                    phone: authUser?.user?.phone || null
                }
            });
        }

        // 4. Resolve Gateway & Credentials
        // NOTE: User requested flexibility, so we respect the passed 'gateway' param if valid, else default to MP
        const targetGateway = (gateway || 'mercadopago').toLowerCase();

        if (targetGateway !== 'mercadopago') {
            // Future-proof: If using Stripe/Other, add logic here.
            return res.status(400).json({ message: 'No momento, assinaturas automáticas são suportadas apenas via Mercado Pago.' });
        }

        const gatewayConfig = plan.barbershop.gatewayConfigs?.find(c => c.gateway.toLowerCase() === targetGateway);
        if (!gatewayConfig || !gatewayConfig.credentials) {
            return res.status(400).json({ message: `Gateway ${targetGateway} não configurado para esta barbearia.` });
        }

        const credentials = gatewayConfig.credentials; // Orchestrator usually decrypts this, but here we access directly? 
        // BETTER: Use Orchestrator helper to get decrypt credentials
        const safeCredentials = await PaymentOrchestrator.getGatewayConfig(plan.barbershopId, targetGateway.toUpperCase());
        const adapter = PaymentOrchestrator.gateways[targetGateway];

        // 5. Ensure Plan Exists in Gateway (Idempotency)
        let mpPlanId = plan.externalId;
        if (!mpPlanId) {
            console.log(`[Subscription] Plan ${plan.name} has no external ID. Creating in ${targetGateway}...`);
            const mpPlan = await adapter.createSubscriptionPlan({ plan, credentials: safeCredentials });
            mpPlanId = mpPlan.id;

            await prisma.subscriptionPlan.update({
                where: { id: plan.id },
                data: { externalId: mpPlanId.toString() }
            });
        }

        // 6. CRITICAL: Create Customer & Save Card Logic
        // We MUST trigger saveCard to get a recurring-ready card ID
        let savedCardId;
        try {
            console.log(`[Subscription] Saving card for Client ${client.id} to ensure recurring capability...`);
            const savedCardResult = await PaymentOrchestrator.saveCard({
                barbershopId: plan.barbershopId,
                client,
                token: effectiveCardToken
            });
            savedCardId = savedCardResult.token; // In MP Adapter, 'token' return is actually the Card ID

            // Persist CardToken locally for reference (optional but good for UX)
            await prisma.cardToken.create({
                data: {
                    clientId: client.id,
                    token: savedCardResult.token,
                    last4: savedCardResult.last4,
                    brand: savedCardResult.brand,
                    expiryMonth: savedCardResult.expiryMonth,
                    expiryYear: savedCardResult.expiryYear,
                    gateway: targetGateway.toUpperCase(),
                    barbershopId: plan.barbershopId,
                    isDefault: true
                }
            });

        } catch (cardError) {
            console.error('[Subscription] Failed to save card:', cardError);
            return res.status(400).json({ message: 'Falha ao salvar cartão para assinatura. Verifique os dados e tente novamente.' });
        }

        // 7. Create Subscription using Saved Card ID
        // Note: Adapter.createSubscription expects 'cardToken' argument. 
        // We pass the savedCardId (which starts with 'card_...') instead of the single-use token.
        const mpSub = await adapter.createSubscription({
            planId: mpPlanId,
            cardToken: savedCardId,
            payerEmail: req.user.email,
            externalReference: authUserId,
            credentials: safeCredentials
        });

        // 8. Handle Response & Create Local Record
        if (mpSub.status !== 'authorized' && mpSub.status !== 'pending') {
            // 'pending' might happen if it needs manual approval, but usually 'authorized' is expected for Credit Card
            // We allow pending to proceed to creation, but marked as such.
            console.warn(`[Subscription] Status is ${mpSub.status}`);
        }

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.validityDays);

        const clientSub = await prisma.clientSubscription.create({
            data: {
                clientId: client.id,
                planId: plan.id,
                status: mpSub.status === 'authorized' ? 'ACTIVE' : 'PENDING',
                startDate: new Date(),
                endDate: endDate,
                paymentMethod: 'CREDIT_CARD',
                remainingCuts: plan.quantityOfCuts,
                externalId: mpSub.subscriptionId.toString()
            }
        });

        res.status(201).json({
            subscriptionId: clientSub.id,
            status: clientSub.status,
            message: 'Assinatura processada com sucesso!'
        });

    } catch (error) {
        console.error('Purchase Plan Error:', error);
        res.status(500).json({ message: error.message || 'Erro ao processar assinatura.' });
    }
};

exports.assignPlanToClient = async (req, res) => {
    try {
        const { clientId, planId } = req.body;

        if (!clientId || !planId) {
            return res.status(400).json({ message: 'Cliente e Plano são obrigatórios' });
        }

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ message: 'Plano não encontrado' });

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.validityDays);

        // Deactivate others
        await prisma.clientSubscription.updateMany({
            where: { clientId, status: 'ACTIVE', plan: { barbershopId: plan.barbershopId } },
            data: { status: 'CANCELLED' }
        });

        const sub = await prisma.clientSubscription.create({
            data: {
                clientId,
                planId,
                startDate: new Date(),
                endDate,
                remainingCuts: plan.quantityOfCuts,
                status: 'ACTIVE'
            }
        });

        res.status(201).json(sub);
    } catch (error) {
        console.error('Assign Plan Error:', error);
        res.status(500).json({ message: 'Erro ao atribuir plano.' });
    }
};
exports.triggerReset = async (req, res) => {
    try {
        await resetMonthlySubscriptions();
        res.json({ message: 'Processo de reset iniciado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao disparar reset.', error: error.message });
    }
};
