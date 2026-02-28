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
                    }
                } else if (orderId) {
                    const order = await tx.order.findUnique({
                        where: { id: orderId },
                        include: { professional: true, client: true, items: true }
                    });
                    if (order) {
                        professionalId = professionalId || order.professionalId;
                        clientName = order.client.name;
                        // For orders, commission might be on Services only
                        commissionBaseValue = order.items
                            .filter(i => i.type === 'SERVICE')
                            .reduce((sum, i) => sum + i.total, 0);
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

            // 5. Generate Commission (If Pro exists and value > 0)
            if (professionalId && commissionBaseValue > 0) {
                // Fetch Pro's commission rate from Professional profile
                const proUser = await tx.user.findUnique({
                    where: { id: professionalId },
                    include: { professionalProfile: true }
                });

                // Default 50% if not set
                const rate = proUser?.professionalProfile?.commissionPercent ?? 50;
                const commissionValue = (commissionBaseValue * rate) / 100;

                await tx.commission.create({
                    data: {
                        barberId: professionalId,
                        barbershopId,
                        transactionId: transaction.id,
                        appointmentId: appointmentId || null,
                        type: 'SERVICE', // Simplify for now
                        description: `Comissão - ${description || 'Venda'}`,
                        amount: commissionValue,
                        percentage: rate,
                        status: 'PENDING'
                    }
                });
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

            return transaction;

        } catch (error) {
            console.error('[TransactionService] createTransaction Error:', error);
            throw error; // Re-throw to be handled by controller
        }
    }
}

module.exports = TransactionService;
