const prisma = require('../lib/prisma');
const caktoService = require('../services/CaktoService');

// Eventos que ativam/renovam o acesso vs. que bloqueiam
const ACTIVATE_EVENTS = ['purchase_approved', 'subscription_created', 'subscription_renewed'];
const OVERDUE_EVENTS = ['subscription_renewal_refused'];
const CANCEL_EVENTS = ['subscription_canceled', 'refund', 'chargeback'];

// O payload da Cakto pode variar por tipo de evento; busca os campos
// nos caminhos conhecidos sem quebrar se algum não existir
function extractFields(body) {
    const data = body?.data || body || {};
    const event = body?.event || body?.event_type || data?.event || null;
    const email = data?.customer?.email || data?.subscriber?.email || body?.customer?.email || null;
    // Na Cakto há UM produto ("Next") com várias ofertas (Start/Pro/Empire × período),
    // então o plano é identificado pela OFERTA. Capturamos os dois.
    const offerId = data?.offer?.id || data?.offer?.short_id || null;
    const productId = data?.product?.id || data?.product?.short_id || data?.product_id || null;
    const subscriptionId = data?.subscription?.id || data?.subscription_id ||
        (typeof data?.subscription === 'string' ? data.subscription : null) ||
        (event?.startsWith('subscription') ? data?.id : null) || null;
    const nextPaymentDate = data?.subscription?.next_payment_date || data?.next_payment_date || null;
    return { event, email, offerId, productId, subscriptionId, nextPaymentDate };
}

async function getPlanMapping() {
    const rows = await prisma.platformSetting.findMany({
        where: { key: { in: ['CAKTO_PRODUCT_SOLO', 'CAKTO_PRODUCT_PRO', 'CAKTO_PRODUCT_ENTERPRISE'] } }
    });
    const map = {};
    for (const row of rows) {
        if (!row.value) continue;
        const plan = row.key.replace('CAKTO_PRODUCT_', '');
        // Aceita múltiplos IDs separados por vírgula (produto + oferta)
        for (const id of row.value.split(',').map(s => s.trim()).filter(Boolean)) {
            map[id] = plan;
        }
    }
    return map;
}

async function notifyMaster(title, message) {
    try {
        const master = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
        if (master) {
            await prisma.notification.create({
                data: { userId: master.id, title, message, type: 'system' }
            });
        }
    } catch (err) {
        console.error('[Cakto Webhook] Failed to notify master:', err.message);
    }
}

exports.handleCaktoWebhook = async (req, res) => {
    let eventRecord = null;
    try {
        // 1. Validação do segredo — a Cakto pode mandar na querystring (?secret=) OU no corpo
        const secretSetting = await prisma.platformSetting.findUnique({ where: { key: 'CAKTO_WEBHOOK_SECRET' } });
        const providedSecret = req.query.secret || req.body?.secret;
        if (!secretSetting?.value || providedSecret !== secretSetting.value) {
            console.warn('[Cakto Webhook] Rejected: invalid or missing secret');
            return res.status(401).json({ message: 'Invalid secret' });
        }

        const { event, email, offerId, productId, subscriptionId, nextPaymentDate } = extractFields(req.body);
        console.log(`[Cakto Webhook] event=${event} email=${email} offer=${offerId} product=${productId} sub=${subscriptionId}`);

        // 2. Auditoria: guarda o evento bruto antes de qualquer processamento
        eventRecord = await prisma.saasWebhookEvent.create({
            data: {
                gateway: 'cakto',
                event,
                email,
                productId: productId ? String(productId) : null,
                raw: req.body || {}
            }
        });

        if (!event || !email) {
            await prisma.saasWebhookEvent.update({
                where: { id: eventRecord.id },
                data: { error: 'Evento sem event/email reconhecível' }
            });
            return res.status(200).json({ received: true, processed: false });
        }

        // 3. Casa o e-mail do comprador com o dono de barbearia
        const authUser = await prisma.authUser.findUnique({
            where: { email: email.toLowerCase() },
            include: { user: { select: { role: true, ownedBarbershops: { select: { id: true, name: true } } } } }
        });
        const barbershop = authUser?.user?.ownedBarbershops?.[0];

        // Blindagem: a conta do dono (SUPER_ADMIN) nunca é alterada pela cobrança.
        // Protege inclusive os testes de compra feitos com o e-mail do dono.
        if (authUser?.user?.role === 'SUPER_ADMIN') {
            await prisma.saasWebhookEvent.update({
                where: { id: eventRecord.id },
                data: { processed: true, error: 'Conta do dono (SUPER_ADMIN) — ignorada de propósito' }
            });
            return res.status(200).json({ received: true, processed: false, reason: 'owner_account_protected' });
        }

        if (!barbershop) {
            await prisma.saasWebhookEvent.update({
                where: { id: eventRecord.id },
                data: { error: 'Nenhuma barbearia encontrada para este e-mail' }
            });
            await notifyMaster(
                'Pagamento Cakto sem barbearia vinculada',
                `Evento "${event}" para ${email} não casou com nenhuma conta. Verifique em SaasWebhookEvent.`
            );
            return res.status(200).json({ received: true, processed: false });
        }

        // 4. Aplica o efeito do evento
        const dataToUpdate = {};

        if (ACTIVATE_EVENTS.includes(event)) {
            dataToUpdate.subscriptionStatus = 'ACTIVE';
            if (subscriptionId) dataToUpdate.caktoSubscriptionId = String(subscriptionId);
            if (nextPaymentDate) dataToUpdate.nextBillingDate = new Date(nextPaymentDate);

            const planMap = await getPlanMapping();
            // Casa primeiro pela oferta (é ela que distingue o plano), depois pelo produto
            const plan = (offerId && planMap[String(offerId)]) || (productId && planMap[String(productId)]) || null;
            if (plan) {
                dataToUpdate.saasPlan = plan;
            } else if (offerId || productId) {
                await notifyMaster(
                    'Oferta Cakto não mapeada',
                    `Evento "${event}" de ${email} — oferta "${offerId}" / produto "${productId}" sem plano configurado no painel Master.`
                );
            }

            // Fim do ciclo com desconto de retenção: restaura o preço original
            const shop = await prisma.barbershop.findUnique({ where: { id: barbershop.id } });
            if (event === 'subscription_renewed' && shop?.retentionDiscountActive && shop?.retentionOriginalAmount) {
                const subId = String(subscriptionId || shop.caktoSubscriptionId || '');
                if (subId && await caktoService.isConfigured()) {
                    try {
                        await caktoService.updateSubscriptionAmount(subId, shop.retentionOriginalAmount);
                        dataToUpdate.retentionDiscountActive = false;
                        dataToUpdate.retentionOriginalAmount = null;
                        console.log(`[Cakto Webhook] Restored original price for shop ${barbershop.id}`);
                    } catch (err) {
                        console.error('[Cakto Webhook] Failed to restore price:', err.message);
                        await notifyMaster(
                            'Falha ao restaurar preço pós-desconto',
                            `Barbearia ${barbershop.name}: restaure manualmente o valor R$ ${shop.retentionOriginalAmount} na Cakto.`
                        );
                    }
                }
            }
        } else if (OVERDUE_EVENTS.includes(event)) {
            dataToUpdate.subscriptionStatus = 'OVERDUE';
        } else if (CANCEL_EVENTS.includes(event)) {
            dataToUpdate.subscriptionStatus = 'CANCELLED';
        } else {
            await prisma.saasWebhookEvent.update({
                where: { id: eventRecord.id },
                data: { error: `Evento "${event}" sem regra definida (ignorado)` }
            });
            return res.status(200).json({ received: true, processed: false });
        }

        await prisma.barbershop.update({ where: { id: barbershop.id }, data: dataToUpdate });
        await prisma.saasWebhookEvent.update({
            where: { id: eventRecord.id },
            data: { processed: true }
        });

        console.log(`[Cakto Webhook] Shop ${barbershop.id} updated:`, dataToUpdate);
        return res.status(200).json({ received: true, processed: true });
    } catch (error) {
        console.error('[Cakto Webhook] Error:', error);
        if (eventRecord) {
            await prisma.saasWebhookEvent.update({
                where: { id: eventRecord.id },
                data: { error: error.message }
            }).catch(() => {});
        }
        // 200 para a Cakto não redisparar em loop por erro interno nosso;
        // o evento fica registrado com o erro para reprocessamento
        return res.status(200).json({ received: true, processed: false });
    }
};
