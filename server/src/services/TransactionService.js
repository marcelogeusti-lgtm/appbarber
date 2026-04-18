const prisma = require('../lib/prisma');

class TransactionService {
    /**
     * Centralized method to record a successful transaction.
     * Creates: Transaction (Income), Commission (Pending).
     * Updates: Appointment (if linked), Order (if linked).
     * 
     * @param {Object} params
     * @param {string} params.barbershopId
     * @param {number} params.amount
     * @param {string} params.method - PIX, CREDIT_CARD, MONEY, DEBIT_CARD
     * @param {string} params.type - INCOME (default) or EXPENSE
     * @param {string} params.origin - ONLINE or PRESENCIAL
     * @param {string} [params.appointmentId]
     * @param {string} [params.orderId]
     * @param {string} [params.description]
     * @param {string} [params.professionalId] - Optional override, otherwise inferred from Appointment/Order
     * @param {Object} [tx] - Optional Prisma Transaction Client
     */
    static async createTransaction(params, tx = prisma) {
        const {
            barbershopId,
            amount,
            method,
            type = 'INCOME',
            origin = 'ONLINE', // Default to ONLINE for safety, override for Manual
            appointmentId,
            orderId,
            description,
            professionalId: explicitProId
        } = params;

        try {
            // 1. Resolve Context (Professional, Service Value for Commission)
            let professionalId = explicitProId;
            let commissionBaseValue = amount; // Default to full amount
            let clientName = '';
            let finalClientId = null;

            // Fetch details if not provided
            if (appointmentId || orderId) {
                if (appointmentId) {
                    const apt = await tx.appointment.findUnique({
                        where: { id: appointmentId },
                        include: { professional: true, client: true }
                    });
                    if (apt) {
                        professionalId = professionalId || apt.professionalId;
                        clientName = apt.client.name;
                        finalClientId = apt.clientId;
                    }
                } else if (orderId) {
                    const order = await tx.order.findUnique({
                        where: { id: orderId },
                        include: { professional: true, client: true, items: true }
                    });
                    if (order) {
                        professionalId = professionalId || order.professionalId;
                        clientName = order.client.name;
                        finalClientId = order.clientId;
                        // Calculate values for commission
                        const items = await tx.orderItem.findMany({ where: { orderId } });
                        const totalGrossVolume = items.reduce((sum, i) => sum + i.total, 0);
                        
                        // Fallback to the transaction amount if no items are found
                        // This ensures commissioned volume is tracked even for top-level comanda payments.
                        commissionBaseValue = totalGrossVolume > 0 ? totalGrossVolume : amount;
                    }
                }
            }

            // 2. Link to Cash Shift (Optional / Non-Blocking)
            const openShift = await tx.cashShift.findFirst({
                where: { barbershopId, status: 'OPEN' }
            });

            // 2.5 Idempotency Check (Prevent duplicate Income transactions for same source)
            if (type === 'INCOME') {
                if (orderId) {
                    const existing = await tx.transaction.findFirst({ where: { orderId, type: 'INCOME' } });
                    if (existing) return existing;
                } else if (appointmentId) {
                    const existing = await tx.transaction.findFirst({ where: { appointmentId, type: 'INCOME' } });
                    if (existing) return existing;
                }
            }

            // 3. Create Transaction
            // Note: DB Push added paymentMethod, origin, professionalId to Transaction
            const transaction = await tx.transaction.create({
                data: {
                    barbershopId,
                    amount,
                    type, // INCOME
                    category: 'Venda de Serviços/Produtos',
                    description: description || `Venda ${origin} - ${clientName}`,
                    date: new Date(),
                    paymentMethod: method,
                    origin: origin,
                    professionalId: professionalId || null,
                    appointmentId: appointmentId || null,
                    orderId: orderId || null,
                    cashShiftId: openShift ? openShift.id : null // Link if open, else null
                }
            });

            // 4. Update Cash Shift Balance (if linked)
            if (openShift) {
                await tx.cashShift.update({
                    where: { id: openShift.id },
                    data: { currentBalance: { increment: Number(amount) } }
                });
            }

            // 5. Generate Commission foi REMOVIDO DAQUI
            // (A lógica de comissão agora pertence exclusivamente e atomicamente ao FinancialService.processCommissions)

            // 5.5. Loyalty Engine (Automated Cashback)
            if (type === 'INCOME' && amount > 0 && finalClientId) {
                const loyaltyProgram = await tx.loyaltyProgram.findUnique({ where: { barbershopId } });
                if (loyaltyProgram?.active) {
                    const pointsEarned = Math.floor(amount * loyaltyProgram.pointsPerReal);
                    if (pointsEarned > 0) {
                        const balance = await tx.clientLoyaltyBalance.upsert({
                            where: { clientId_barbershopId: { clientId: finalClientId, barbershopId } },
                            update: { points: { increment: pointsEarned } },
                            create: { clientId: finalClientId, barbershopId, points: pointsEarned }
                        });
                        await tx.loyaltyLedger.create({
                            data: {
                                clientLoyaltyId: balance.id,
                                type: 'EARN',
                                points: pointsEarned,
                                description: `Ganho de pontos na compra de R$ ${amount}`,
                                transactionId: transaction.id
                            }
                        });
                    }
                }
            }


            // 6. Update Appointment/Order Status (Idempotent)
            if (appointmentId) {
                await tx.appointment.update({
                    where: { id: appointmentId },
                    data: {
                        status: 'COMPLETED', // Or CONFIRMED -> COMPLETED? Usually payment completes it.
                        paymentStatus: 'PAID',
                        paymentMethod: method
                    }
                });
            }

            if (orderId) {
                await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'CLOSED', // Explicitly close it
                        paymentStatus: 'PAID',
                        paymentMethod: method,
                        paidAt: new Date()
                    }
                });
            }

            // 7. EMIT NFE (IF REQUESTED)
            if (params.emitNfe) {
                if (finalClientId) {
                    const nfeService = require('./NfeService');
                    // We don't necessarily 'await' the full process if we want fast response, 
                    // but for MOCK simplicity we wait here.
                    nfeService.emitNfe({
                        barbershopId,
                        clientId: finalClientId,
                        appointmentId,
                        orderId,
                        amount
                    }).catch(e => console.error('[TransactionService] Background NFe Error:', e));
                }
            }

            return transaction;

        } catch (error) {
            console.error('[TransactionService] createTransaction Error:', error);
            throw error; // Re-throw to be handled by controller
        }
    }
}

module.exports = TransactionService;
