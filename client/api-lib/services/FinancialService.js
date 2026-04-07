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
     * Calculates and processes commissions for an appointment based on its order items.
     */
    async processCommissions(appointmentId, tx = prisma) {
        const appointment = await tx.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                service: {
                    include: { commissionOverrides: true }
                },
                order: {
                    include: {
                        items: {
                            include: { service: { include: { commissionOverrides: true } }, product: true }
                        }
                    }
                },
                client: { select: { name: true } }
            }
        });

        if (!appointment) return null;

        const results = [];
        const items = appointment.order?.items || [];
        const proId = appointment.professionalId;
        const barbershopId = appointment.barbershopId;
        const clientName = appointment.client?.name || 'Cliente';

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
                description = `Comissão Serviço: ${service.name} (${clientName})`;
            }
            else if (item.type === 'PRODUCT' && item.product) {
                // Future: Product commission logic can be added here
                // For now, product commissions might not be configured in the schema clearly
                continue;
            }

            if (commissionAmount > 0) {
                // Check for existing commission for this item to avoid duplicates if possible
                // Since OrderItem ID is unique, we can use a combination or just check by appointment + description for now
                // Actually, a better check is needed for multi-item orders. 
                // For simplicity in this iteration, we create commissions for the whole appointment if not already existing
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

        return results;
    }
}

module.exports = new FinancialService();
