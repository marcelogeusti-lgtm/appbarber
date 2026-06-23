const crypto = require('crypto');
const prisma = require('../../lib/prisma');
const saasWebhookMapping = require('../../config/saasWebhookMapping');

class SaaSWebhookService {
    /**
     * Process Kiwify Webhook
     */
    async processKiwify(req) {
        const signature = req.query.signature;
        const secret = process.env.KIWIFY_SECRET;

        // 1. Signature Verification (Only if KIWIFY_SECRET is set)
        if (secret && signature) {
            const payloadString = JSON.stringify(req.body);
            const hash = crypto.createHmac('sha1', secret).update(payloadString).digest('hex');
            if (hash !== signature) {
                console.error('[SaaSWebhookService] Invalid Kiwify signature.');
                throw new Error('Assinatura inválida da Kiwify');
            }
        }

        const { event_type, Customer, Product, Subscription } = req.body;
        const email = (Customer?.email || '').trim();
        const productId = Product?.product_id;
        const externalSubId = Subscription?.id;

        if (!email) {
            console.error('[SaaSWebhookService] Kiwify payload missing Customer email.');
            throw new Error('E-mail do comprador não fornecido');
        }

        console.log(`[SaaSWebhookService] Kiwify Webhook event "${event_type}" received for buyer: ${email}`);

        // 2. Map Event to Status
        let targetStatus = null;
        if (event_type === 'order_approved' || event_type === 'subscription_renewed') {
            targetStatus = 'ACTIVE';
        } else if (event_type === 'subscription_late') {
            targetStatus = 'OVERDUE';
        } else if (event_type === 'subscription_canceled' || event_type === 'refunded' || event_type === 'chargedback') {
            targetStatus = 'CANCELLED';
        }

        return await this.updateBarbershopSubscription({
            email,
            productId,
            platform: 'kiwify',
            targetStatus,
            externalSubId,
            rawEvent: event_type
        });
    }

    /**
     * Process Kirvano Webhook
     */
    async processKirvano(req) {
        const signature = req.headers['x-kirvano-signature'];
        const secret = process.env.KIRVANO_SECRET;

        // 1. Signature Verification (Only if KIRVANO_SECRET is set)
        if (secret && signature) {
            const payloadString = JSON.stringify(req.body);
            const hash = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
            if (hash !== signature) {
                console.error('[SaaSWebhookService] Invalid Kirvano signature.');
                throw new Error('Assinatura inválida da Kirvano');
            }
        }

        const { event, data } = req.body;
        const email = (data?.customer?.email || '').trim();
        const productId = data?.product?.id;
        const externalSubId = data?.subscription?.id;

        if (!email) {
            console.error('[SaaSWebhookService] Kirvano payload missing customer email.');
            throw new Error('E-mail do comprador não fornecido');
        }

        console.log(`[SaaSWebhookService] Kirvano Webhook event "${event}" received for buyer: ${email}`);

        // 2. Map Event to Status
        let targetStatus = null;
        if (event === 'sale.approved' || event === 'subscription.active') {
            targetStatus = 'ACTIVE';
        } else if (event === 'subscription.overdue') {
            targetStatus = 'OVERDUE';
        } else if (event === 'subscription.canceled' || event === 'sale.refunded' || event === 'sale.chargedback') {
            targetStatus = 'CANCELLED';
        }

        return await this.updateBarbershopSubscription({
            email,
            productId,
            platform: 'kirvano',
            targetStatus,
            externalSubId,
            rawEvent: event
        });
    }

    /**
     * Core update business logic
     */
    async updateBarbershopSubscription({ email, productId, platform, targetStatus, externalSubId, rawEvent }) {
        if (!targetStatus) {
            console.log(`[SaaSWebhookService] Event "${rawEvent}" ignored (no state transition mapped).`);
            return { processed: false, reason: `Ignored event: ${rawEvent}` };
        }

        // 1. Find User by Email
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive' // Case-insensitive matching
                }
            },
            include: {
                ownedBarbershops: true
            }
        });

        if (!user) {
            console.warn(`[SaaSWebhookService] No user found with email: ${email}. Logging as unassociated_buyer.`);
            return {
                processed: false,
                reason: 'unassociated_buyer',
                email
            };
        }

        const barbershop = user.ownedBarbershops?.[0];
        if (!barbershop) {
            console.warn(`[SaaSWebhookService] User found with email: ${email} but owns no barbershops.`);
            return {
                processed: false,
                reason: 'user_has_no_barbershops',
                userId: user.id
            };
        }

        // 2. Resolve Plan key based on Product ID Mapping
        const platformMapping = saasWebhookMapping[platform] || {};
        const targetPlan = platformMapping[productId];

        // 3. Prepare Update Data
        const updateData = {
            subscriptionStatus: targetStatus
        };

        if (targetPlan && targetStatus === 'ACTIVE') {
            updateData.saasPlan = targetPlan;
        }

        // If active, reset trialEndsAt or set subscription ends mapping if desired
        if (targetStatus === 'ACTIVE') {
            updateData.trialEndsAt = null; // Clear trial if active paid subscriber
        }

        // 4. Execute Update
        const updatedShop = await prisma.barbershop.update({
            where: { id: barbershop.id },
            data: updateData
        });

        // 5. Store External Subscription ID if available for audit trail
        if (externalSubId) {
            try {
                const existing = await prisma.subscriptionExternal.findFirst({
                    where: { externalId: externalSubId }
                });
                if (existing) {
                    await prisma.subscriptionExternal.update({
                        where: { id: existing.id },
                        data: {
                            status: targetStatus,
                            ...(targetPlan ? { plan: targetPlan } : {})
                        }
                    });
                } else {
                    await prisma.subscriptionExternal.create({
                        data: {
                            externalId: externalSubId,
                            gateway: platform.toUpperCase(),
                            status: targetStatus,
                            plan: targetPlan || 'UNKNOWN',
                            userId: user.id,
                            startedAt: new Date(),
                            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        }
                    });
                }
            } catch (err) {
                console.error('[SaaSWebhookService] Failed to log SubscriptionExternal:', err.message);
            }
        }

        console.log(`[SaaSWebhookService] Barbershop "${updatedShop.name}" status updated to "${targetStatus}" (Plan: ${updatedShop.saasPlan}).`);
        return {
            processed: true,
            barbershopId: updatedShop.id,
            status: targetStatus,
            plan: updatedShop.saasPlan
        };
    }
}

module.exports = new SaaSWebhookService();
