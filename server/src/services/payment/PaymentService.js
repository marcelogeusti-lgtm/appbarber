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
            const appointment = await prisma.appointment.update({
                where: { id: p.appointmentId },
                data: { status: 'CONFIRMED' },
                include: { client: true, professional: true, barbershop: true }
            });

            // Emit Update Event for Automation (Old Status was PENDING_PAYMENT for Online)
            const eventBus = require('../events/eventBus');
            eventBus.emit('APPOINTMENT_UPDATED', { 
                appointment, 
                oldStatus: appointment.status === 'PENDING_PAYMENT' ? 'PENDING_PAYMENT' : 'PENDING' 
            });
            
            // Emit to socket for real-time dashboard update
            try {
                const socket = require('../../socket');
                const io = socket.getIO();
                if (io) io.to(appointment.barbershopId).emit('appointment_updated', appointment);
            } catch (sErr) { /* ignore */ }

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
            await prisma.appointment.update({
                where: { id: p.appointmentId },
                data: { status: 'CANCELLED' }
            }).catch(err => console.error('[PaymentService] Failed to cancel appointment:', err.message));
        }

        // 3. Mark Order as CANCELLED
        if (p.orderId) {
            await prisma.order.update({
                where: { id: p.orderId },
                data: { status: 'CANCELLED' }
            }).catch(err => console.error('[PaymentService] Failed to cancel order:', err.message));
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
                    data: { 
                        status: result.status,
                        statusDetail: result.statusDetail || payment.statusDetail
                    }
                });

                if (result.status === 'paid' || result.status === 'approved') {
                    await this.handlePaymentApproval(updated);
                } else if (result.status === 'failed' || result.status === 'rejected') {
                    await this.handlePaymentFailure(updated, result);
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
