const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay } = require('date-fns');
const prisma = new PrismaClient();

// Relatório de Comissões por Barbeiro
exports.getCommissionsReport = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
        const end = endDate ? new Date(endDate) : new Date();

        // Buscar todos os barbeiros da barbearia
        const barbers = await prisma.user.findMany({
            where: {
                workedBarbershopId: barbershopId,
                role: 'BARBER'
            },
            select: {
                id: true,
                name: true
            }
        });

        // Buscar agendamentos completados no período
        const appointments = await prisma.appointment.findMany({
            where: {
                barbershopId,
                status: 'COMPLETED',
                date: {
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            },
            include: {
                service: true,
                professional: { select: { id: true, name: true } }
            }
        });

        // Buscar comissões existentes
        const commissions = await prisma.commission.findMany({
            where: {
                barbershopId,
                createdAt: {
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            },
            include: {
                barber: { select: { id: true, name: true } }
            }
        });

        // Calcular estatísticas por barbeiro
        const barberStats = barbers.map(barber => {
            // Agendamentos do barbeiro
            const barberAppointments = appointments.filter(apt => apt.professionalId === barber.id);

            // Vendas totais
            const totalSales = barberAppointments.reduce((sum, apt) => sum + Number(apt.service.price), 0);

            // Total de serviços
            const totalServices = barberAppointments.reduce((sum, apt) => sum + Number(apt.service.price), 0);

            // Comissão por serviços (50%)
            const serviceCommission = totalServices * 0.5;

            // Comissões de produtos (simulado)
            const barberCommissions = commissions.filter(c => c.barberId === barber.id);
            const productCommission = barberCommissions
                .filter(c => c.type === 'PRODUCT')
                .reduce((sum, c) => sum + Number(c.amount), 0);

            // Comissão por assinaturas
            const subscriptionCommission = barberCommissions
                .filter(c => c.type === 'SUBSCRIPTION')
                .reduce((sum, c) => sum + Number(c.amount), 0);

            // Extras
            const extras = barberCommissions
                .filter(c => c.type === 'EXTRA')
                .reduce((sum, c) => sum + Number(c.amount), 0);

            // Compras de produto (débito)
            const productPurchases = barberCommissions
                .filter(c => c.amount < 0)
                .reduce((sum, c) => sum + Math.abs(Number(c.amount)), 0);

            // Total de comissões
            const totalCommissions = serviceCommission + productCommission + subscriptionCommission + extras;

            // Comissões pagas vs pendentes
            const paidCommissions = barberCommissions
                .filter(c => c.status === 'PAID')
                .reduce((sum, c) => sum + Number(c.amount), 0);

            const pendingCommissions = barberCommissions
                .filter(c => c.status === 'PENDING')
                .reduce((sum, c) => sum + Number(c.amount), 0);

            return {
                barberId: barber.id,
                barberName: barber.name,
                appointmentCount: barberAppointments.length,
                totalSales,
                totalServices,
                serviceCommission,
                productCommission,
                subscriptionCommission,
                extras,
                productPurchases,
                totalCommissions,
                paidCommissions,
                pendingCommissions
            };
        });

        // Resumo geral
        const summary = {
            totalSales: barberStats.reduce((sum, b) => sum + b.totalSales, 0),
            totalServices: barberStats.reduce((sum, b) => sum + b.totalServices, 0),
            totalSubscriptions: appointments.filter(apt => apt.paymentMethod === 'SUBSCRIPTION').length,
            totalPaidCommissions: barberStats.reduce((sum, b) => sum + b.paidCommissions, 0),
            totalPendingCommissions: barberStats.reduce((sum, b) => sum + b.pendingCommissions, 0)
        };

        res.json({
            summary,
            barbers: barberStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Dar baixa em comissões
exports.payCommissions = async (req, res) => {
    try {
        const { barberId, barbershopId } = req.body;

        await prisma.commission.updateMany({
            where: {
                barberId,
                barbershopId,
                status: 'PENDING'
            },
            data: {
                status: 'PAID',
                paidAt: new Date()
            }
        });

        res.json({ message: 'Comissões pagas com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Criar comissão manual
exports.createCommission = async (req, res) => {
    try {
        const { barberId, barbershopId, type, description, amount } = req.body;

        const commission = await prisma.commission.create({
            data: {
                barberId,
                barbershopId,
                type,
                description,
                amount: parseFloat(amount)
            }
        });

        res.status(201).json(commission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
