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

        // --- NEW: STRICT GATEWAY ACTIVE CHECK ---
        const gatewayConfig = await prisma.gatewayConfig.findUnique({
            where: {
                barbershopId_gateway: {
                    barbershopId,
                    gateway: gateway.toUpperCase()
                }
            }
        });

        if (!gatewayConfig || !gatewayConfig.isActive) {
            throw new Error(`Esta barbearia não está aceitando pagamentos online no momento (Gateway Desativado).`);
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
            let qrCodeBase64 = paymentResult.qrCodeBase64;

            // --- REDUNDANCY: Generate QR Code locally if Gateway fails to provide image ---
            if (!qrCodeBase64 && (paymentResult.pixCopiaECola || paymentResult.qrCode)) {
                try {
                    const QRCode = require('qrcode');
                    const pixString = paymentResult.pixCopiaECola || paymentResult.qrCode;
                    const dataUrl = await QRCode.toDataURL(pixString);
                    qrCodeBase64 = dataUrl.split(',')[1]; // Strip "data:image/png;base64,"
                    console.log(`[PaymentService] Generated local QR Code for Payment ${pendingPayment.id}`);
                } catch (qrErr) {
                    console.error('[PaymentService] Failed to generate local QR Code:', qrErr);
                }
            }

            const updatedPayment = await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: {
                    gateway: paymentResult.gateway,
                    externalId: paymentResult.paymentId,
                    status: paymentResult.status,
                    qrCode: paymentResult.qrCode,
                    qrCodeBase64: qrCodeBase64,
                    pixCopiaECola: paymentResult.pixCopiaECola,
                    ticketUrl: paymentResult.ticketUrl,
                    statusDetail: paymentResult.statusDetail
                }
            });

            // 4. Handle Immediate Approval
            if (paymentResult.status === 'paid' || paymentResult.status === 'approved') {
                await this.handlePaymentApproval(updatedPayment);
            } else if (paymentResult.status === 'failed' || paymentResult.status === 'rejected' || paymentResult.status === 'cancelled') {
                await this.handlePaymentFailure(updatedPayment, paymentResult);
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
            // [Fix] Get current status before update to correctly report in event bus
            const currentApp = await prisma.appointment.findUnique({ 
                where: { id: p.appointmentId },
                include: { client: true, professional: true, barbershop: true }
            });
            const oldStatus = currentApp?.status || 'PENDING_PAYMENT';

            // ATENÇÃO: Webhook Protection! 
            // Se o pagamento for aprovado agora, mas o CronJob já tiver cancelado a venda (Timeout),
            // NÃO devolvemos para CONFIRMED para não engolir o horário que talvez já tenha sido vendido.
            // Em vez disso, deixamos CANCELLED e avisamos o barbeiro.
            if (oldStatus === 'CANCELLED') {
                console.log(`[PaymentService/WebhookProtection] Payment ${p.id} approved late for a CANCELLED appointment ${p.appointmentId}. Sending Notice.`);
                const eventBus = require('../events/eventBus');
                eventBus.emit('LATE_WEBHOOK_WARNING', currentApp);
            } else {
                // Fluxo Normal
                const appointment = await prisma.appointment.update({
                    where: { id: p.appointmentId },
                    data: { status: 'CONFIRMED' },
                    include: { client: true, professional: true, barbershop: true }
                });
                
                // Emit Update Event for Automation
                const eventBus = require('../events/eventBus');
                eventBus.emit('APPOINTMENT_UPDATED', { 
                    appointment, 
                    oldStatus: oldStatus 
                });
                
                // Emit to socket for real-time dashboard update
                try {
                    const socket = require('../../socket');
                    const io = socket.getIO();
                    if (io) io.to(appointment.barbershopId).emit('appointment_updated', appointment);
                } catch (sErr) { /* ignore */ }
            }
        }

        if (p.orderId) {
            await prisma.order.update({
                where: { id: p.orderId },
                data: { status: 'PAID', paidAt: new Date(), paymentStatus: 'PAID' }
            }).catch(err => console.error('[PaymentService] Order update failed:', err.message));
        }
    }

    /**
     * Logic to execute when a payment fails/is rejected.
     */
    async handlePaymentFailure(payment, result) {
        const p = typeof payment === 'string' ?
            await prisma.payment.findUnique({ where: { id: payment } }) : payment;

        if (!p) return;

        const reason = result.statusDetail || 'Rejeitado pelo Mercado Pago';
        console.log(`[PaymentService] Processing failure for Payment ${p.id}. Reason: ${reason}`);

        // 1. Audit Log Entry
        const AuditLogService = require('../AuditLogService');
        await AuditLogService.log({
            action: 'PAYMENT_FAILED',
            entity: 'Payment',
            entityId: p.id,
            barbershopId: p.barbershopId,
            newData: { status: 'failed', detail: reason }
        });

        // 2. Cancel related appointment if exists
        if (p.appointmentId) {
            console.log(`[PaymentService] 🏳️ Cancelling Appointment ${p.appointmentId} due to payment failure.`);
            const updatedApp = await prisma.appointment.update({
                where: { id: p.appointmentId },
                data: { status: 'CANCELLED', statusDetail: 'REJECTED' },
                include: { client: true, professional: true, barbershop: true, service: true }
            }).catch(err => console.error('[PaymentService] Failed to cancel appointment:', err.message));

            if (updatedApp) {
                const eventBus = require('../events/eventBus');
                eventBus.emit('PAYMENT_REJECTED', { appointment: updatedApp, reason });
            }
        }

        // 3. Mark Order as CANCELLED
        if (p.orderId) {
            await prisma.order.update({
                where: { id: p.orderId },
                data: { status: 'CANCELLED' }
            }).catch(err => console.error('[PaymentService] Failed to cancel order:', err.message));
        }

        // 4. Se o pagamento era de uma assinatura (fluxo SubscriptionEngine), cancela-a:
        // a cobrança falhou, o plano não pode ficar ativo/pendente aguardando para sempre
        if (p.clientSubscriptionId) {
            await prisma.clientSubscription.updateMany({
                where: { id: p.clientSubscriptionId, status: { in: ['PENDING', 'ACTIVE'] } },
                data: { status: 'CANCELLED', remainingCuts: 0 }
            }).catch(err => console.error('[PaymentService] Failed to cancel subscription:', err.message));
        }
    }

    /**
     * Revoga a assinatura do cliente quando o pagamento é estornado ou sofre chargeback.
     * Regra do negócio: cliente que recebeu o dinheiro de volta perde os cortes na hora.
     * A assinatura pode estar ligada via Payment.clientSubscriptionId (fluxo purchase)
     * ou via ClientSubscription.externalId = id do pagamento no gateway (fluxo subscribe).
     */
    async revokeSubscriptionForRefund(externalPaymentId, paymentRecord, reason) {
        let sub = null;

        if (paymentRecord?.clientSubscriptionId) {
            sub = await prisma.clientSubscription.findUnique({
                where: { id: paymentRecord.clientSubscriptionId }
            });
        }
        if (!sub && externalPaymentId) {
            sub = await prisma.clientSubscription.findFirst({
                where: { externalId: String(externalPaymentId) }
            });
        }

        if (!sub || sub.status === 'CANCELLED') return;

        await prisma.clientSubscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELLED', remainingCuts: 0 }
        });

        const AuditLogService = require('../AuditLogService');
        await AuditLogService.log({
            action: 'SUBSCRIPTION_REVOKED',
            entity: 'ClientSubscription',
            entityId: sub.id,
            newData: { status: 'CANCELLED', remainingCuts: 0, reason: reason || 'refund/chargeback' }
        }).catch(e => require('../../lib/logger').warn(
            { err: e, action: 'audit_log_failed', entity: 'ClientSubscription' },
            'Falha ao registrar auditoria da revogação'
        ));

        console.log(`[PaymentService] 🔒 Subscription ${sub.id} revoked (${reason}). Access removed.`);
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
                    data: { 
                        status: result.status,
                        statusDetail: result.statusDetail || payment.statusDetail
                    }
                });

                if (result.status === 'paid' || result.status === 'approved') {
                    await this.handlePaymentApproval(updated);
                } else if (result.status === 'failed' || result.status === 'rejected' || result.status === 'cancelled') {
                    await this.handlePaymentFailure(updated, result);
                }
            }

            // Estorno/chargeback: revoga a assinatura vinculada mesmo que não exista
            // registro local de Payment (o fluxo /subscribe guarda o id do pagamento
            // direto em ClientSubscription.externalId, sem criar Payment)
            if (result.status === 'refunded' || result.status === 'chargeback') {
                await this.revokeSubscriptionForRefund(result.externalId, payment, result.status);
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
                    // Cancelou no gateway → perde o direito aos cortes restantes
                    data: newStatus === 'CANCELLED'
                        ? { status: newStatus, remainingCuts: 0 }
                        : { status: newStatus }
                });
            }
        }

        return result;
    }
}

module.exports = new PaymentService();
