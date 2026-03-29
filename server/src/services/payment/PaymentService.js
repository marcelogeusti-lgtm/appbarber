const prisma = require('../../lib/prisma');
const PaymentOrchestrator = require('./PaymentOrchestrator');
const TransactionService = require('../TransactionService');

/**
 * PaymentService handles business logic and persistence for payments.
 * It decouples the controllers from the gateway-specific orchestration.
 */
class PaymentService {

    /**
     * Standardized payment creation flow.
     */
    /**
     * Standardized payment creation flow.
     */
    async createPayment(params) {
        const {
            amount,
            method,
            description,
            barbershopId,
            userId,
            clientId,
            appointmentId,
            orderId,
            customer,
            gateway = 'mercadopago'
        } = params;

        // 0. Validate Barber Settings
        const barbershop = await prisma.barbershop.findUnique({
            where: { id: barbershopId },
            select: { enabledPaymentMethods: true }
        });

        if (barbershop && barbershop.enabledPaymentMethods.length > 0) {
            const mappedMethod = method.toUpperCase();
            const isAllowed = barbershop.enabledPaymentMethods.some(m =>
                m === mappedMethod ||
                (mappedMethod.includes('CARD') && (m === 'CREDIT_CARD' || m === 'DEBIT_CARD')) ||
                (mappedMethod === 'PIX' && m === 'PIX')
            );

            if (!isAllowed) {
                throw new Error(`O método de pagamento ${method} não é aceito por esta barbearia.`);
            }
        }

        // 1. Create Pending Payment in DB
        const pendingPayment = await prisma.payment.create({
            data: {
                gateway: 'PENDING',
                method,
                status: 'PENDING',
                amount: parseFloat(amount),
                userId,
                clientId,
                appointmentId,
                orderId,
                barbershopId
            }
        });

        try {
            // 2. Call Gateway Orchestrator
            const paymentResult = await PaymentOrchestrator.createPayment({
                ...params,
                externalId: pendingPayment.id // Link to DB UUID for stable idempotency
            });

            // 3. Update Payment with Gateway Details
            const updatedPayment = await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: {
                    gateway: paymentResult.gateway,
                    externalId: paymentResult.paymentId,
                    status: paymentResult.status,
                    qrCode: paymentResult.pixCopiaECola,
                    pixCopiaECola: paymentResult.pixCopiaECola,
                    ticketUrl: paymentResult.ticketUrl,
                    statusDetail: paymentResult.statusDetail
                }
            });

            // 4. Handle Immediate Approval
            if (paymentResult.status === 'paid' || paymentResult.status === 'approved') {
                await this.handlePaymentApproval(updatedPayment);
            }

            return {
                id: updatedPayment.id,
                externalId: updatedPayment.externalId,
                status: updatedPayment.status,
                statusDetail: updatedPayment.statusDetail,
                qrCode: updatedPayment.qrCode,
                qrCodeBase64: paymentResult.qrCodeBase64,
                pixCopiaECola: updatedPayment.pixCopiaECola,
                ticketUrl: updatedPayment.ticketUrl,
                checkoutUrl: paymentResult.checkoutUrl
            };

        } catch (error) {
            console.error('[PaymentService] Error creating payment:', error);

            // Mark as failed in DB
            await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: { status: 'FAILED' }
            });

            throw error;
        }
    }

    /**
     * Logic to execute when a payment is approved.
     */
    async handlePaymentApproval(payment) {
        const p = typeof payment === 'string' ?
            await prisma.payment.findUnique({ where: { id: payment } }) : payment;

        if (!p || (p.status !== 'paid' && p.status !== 'approved')) return;

        console.log(`[PaymentService] Processing approval for Payment ${p.id}`);

        // 1. Register Financial Transaction (Unified)
        await TransactionService.createTransaction({
            barbershopId: p.barbershopId,
            amount: p.amount,
            method: p.method,
            origin: 'ONLINE',
            appointmentId: p.appointmentId,
            orderId: p.orderId,
            description: `Pagamento Online - Ref #${p.id.substring(0, 8)}`
        }).catch(err => console.error('[PaymentService] Transaction log failed:', err.message));

        // 2. Update Related Entities
        if (p.appointmentId) {
            await prisma.appointment.update({
                where: { id: p.appointmentId },
                data: { status: 'CONFIRMED' }
            }).catch(err => console.error('[PaymentService] Appointment confirmation failed:', err.message));
        }

        if (p.orderId) {
            await prisma.order.update({
                where: { id: p.orderId },
                data: { status: 'PAID', paidAt: new Date(), paymentStatus: 'PAID' }
            }).catch(err => console.error('[PaymentService] Order update failed:', err.message));
        }
    }

    /**
     * Processes a webhook update.
     */
    async processWebhook(gatewayName, req) {
        // 1. Validate & Extract via Orchestrator
        const result = await PaymentOrchestrator.processWebhook(gatewayName, req);

        if (!result.isValid) return result;

        console.log(`[PaymentService] Processing ${result.type} webhook for ${result.externalId} with status ${result.status}`);

        // 2. Handle based on notification type
        if (result.type === 'payment') {
            const payment = await prisma.payment.findFirst({
                where: { externalId: result.externalId }
            });

            if (payment && payment.status !== result.status) {
                const updated = await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: result.status }
                });

                if (result.status === 'paid' || result.status === 'approved') {
                    await this.handlePaymentApproval(updated);
                }
            }
        } else if (result.type === 'subscription') {
            // Handle preapproval/subscription status
            const subscription = await prisma.clientSubscription.findFirst({
                where: { externalId: result.externalId }
            });

            if (subscription) {
                // Map status: 'authorized'/'active' -> ACTIVE
                const newStatus = (result.status === 'authorized' || result.status === 'active' || result.status === 'approved') ? 'ACTIVE' :
                    (result.status === 'cancelled') ? 'CANCELLED' : 'PENDING';

                await prisma.clientSubscription.update({
                    where: { id: subscription.id },
                    data: { status: newStatus }
                });
            }
        }

        return result;
    }
}

module.exports = new PaymentService();
