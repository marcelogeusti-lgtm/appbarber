const prisma = require('../lib/prisma');

/**
 * FinancialService handles all automated financial movements in the system.
 * It ensures that when an event happens (order completion, commission payment),
 * the corresponding Transaction and Commission records are created correctly.
 */
class FinancialService {
    /**
     * Records an income transaction (Entrance)
     */
    async recordIncome({ amount, description, category, barbershopId, appointmentId, orderId, professionalId, paymentMethod, origin }) {
        return await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                description,
                type: 'INCOME',
                category: category || 'Serviço',
                barbershopId,
                appointmentId,
                orderId,
                professionalId,
                paymentMethod,
                origin: origin || 'PRESENCIAL',
                date: new Date()
            }
        });
    }

    /**
     * Records an expense transaction (Exit)
     */
    async recordExpense({ amount, description, category, barbershopId, professionalId, paymentMethod }) {
        return await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                description,
                type: 'EXPENSE',
                category: category || 'Comissão',
                barbershopId,
                professionalId,
                paymentMethod: paymentMethod || 'CASH',
                date: new Date()
            }
        });
    }

    /**
    /**
     * Calculates and processes commissions for an appointment or order based on its items.
     */
    async processCommissions({ appointmentId, orderId }, tx = prisma) {
        let order = null;
        let appointment = null;
        let proId = null;
        let barbershopId = null;
        let clientName = 'Cliente';

        if (orderId) {
            order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    items: { include: { service: { include: { commissionOverrides: true } }, product: true } },
                    client: { select: { name: true } }
                }
            });
            if (order) {
                proId = order.professionalId;
                barbershopId = order.barbershopId;
                clientName = order.client?.name || 'Cliente';
                appointmentId = order.appointmentId || null;
            }
        } else if (appointmentId) {
            appointment = await tx.appointment.findUnique({
                where: { id: appointmentId },
                include: {
                    order: {
                        include: {
                            items: { include: { service: { include: { commissionOverrides: true } }, product: true } }
                        }
                    },
                    client: { select: { name: true } }
                }
            });
            if (appointment) {
                order = appointment.order;
                proId = appointment.professionalId;
                barbershopId = appointment.barbershopId;
                clientName = appointment.client?.name || 'Cliente';
            }
        }

        if (!order) return null;

        const results = [];
        const items = order.items || [];

        for (const item of items) {
            let commissionAmount = 0;
            let percentage = null;
            let description = '';

            if (item.type === 'SERVICE' && item.service) {
                const service = item.service;
                const override = service.commissionOverrides?.find(o => o.professionalId === proId);

                const commType = override ? override.type : service.commissionType;
                const commValue = override ? Number(override.value) : Number(service.commissionValue);

                if (commType === 'PERCENTAGE') {
                    commissionAmount = Number(item.total) * (commValue / 100);
                    percentage = commValue;
                } else {
                    commissionAmount = commValue * item.quantity;
                }
                description = `Comissão Serviço (ID: ${item.id.slice(-4)}): ${service.name} (${clientName})`;
            }
            else if (item.type === 'PRODUCT' && item.product) {
                continue;
            }

            if (commissionAmount > 0) {
                // Ensure idempotency for this orderItem to prevent duplicates
                const existing = await tx.commission.findFirst({
                    where: {
                        barbershopId,
                        barberId: proId,
                        description: description
                    }
                });

                if (!existing) {
                    const commission = await tx.commission.create({
                        data: {
                            barberId: proId,
                            barbershopId,
                            appointmentId,
                            type: item.type === 'SERVICE' ? 'SERVICE' : 'PRODUCT',
                            description,
                            amount: commissionAmount,
                            percentage,
                            status: 'PENDING'
                        }
                    });
                    results.push(commission);
                }
            }
        }

        return results;
    }
}

module.exports = new FinancialService();
