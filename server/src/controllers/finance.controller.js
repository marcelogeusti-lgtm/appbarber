const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay, eachDayOfInterval, format } = require('date-fns');
const prisma = new PrismaClient();

// Dashboard Financeiro Completo
exports.getFinancialDashboard = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // Primeiro dia do mês
        const end = endDate ? new Date(endDate) : new Date(); // Hoje

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
                professional: { select: { id: true, name: true } },
                client: { select: { id: true, name: true } }
            }
        });

        // Buscar transações (despesas e outras receitas)
        const transactions = await prisma.transaction.findMany({
            where: {
                barbershopId,
                date: {
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            }
        });

        // Calcular faturamento por dia (para o gráfico)
        const daysInterval = eachDayOfInterval({ start, end });
        const revenueByDay = daysInterval.map(day => {
            const dayStr = format(day, 'dd/MM');
            const dayRevenue = appointments
                .filter(apt => format(new Date(apt.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                .reduce((sum, apt) => sum + Number(apt.service.price), 0);
            return { date: dayStr, value: dayRevenue };
        });

        // KPIs
        const totalRevenue = appointments.reduce((sum, apt) => sum + Number(apt.service.price), 0);
        const totalClients = new Set(appointments.map(apt => apt.clientId)).size;
        const avgClientsPerDay = (totalClients / daysInterval.length).toFixed(2);

        // Comandas em aberto (agendamentos confirmados mas não completados)
        const openAppointments = await prisma.appointment.count({
            where: {
                barbershopId,
                status: 'CONFIRMED',
                date: {
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            }
        });

        const openCommandsValue = await prisma.appointment.findMany({
            where: {
                barbershopId,
                status: 'CONFIRMED',
                date: {
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            },
            include: { service: true }
        });

        const totalOpenCommands = openCommandsValue.reduce((sum, apt) => sum + Number(apt.service.price), 0);

        // Despesas
        const totalExpenses = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // Saldo
        const totalReceived = totalRevenue;
        const balance = totalReceived - totalExpenses;

        // Valores a receber (agendamentos futuros confirmados)
        const futureAppointments = await prisma.appointment.findMany({
            where: {
                barbershopId,
                status: 'CONFIRMED',
                date: { gte: new Date() }
            },
            include: { service: true }
        });

        const toReceive = futureAppointments.reduce((sum, apt) => sum + Number(apt.service.price), 0);

        // Dividir valores a receber por método de pagamento (simulado - você pode adicionar campo paymentMethod)
        const toReceiveCash = toReceive * 0.4; // 40% dinheiro
        const toReceiveCard = toReceive * 0.35; // 35% cartão
        const toReceivePix = toReceive * 0.25; // 25% pix

        res.json({
            // Gráfico
            revenueByDay,

            // KPIs
            totalRevenue,
            totalClients,
            avgClientsPerDay,
            openCommands: openAppointments,
            totalOpenCommands,

            // Saldo
            balance,
            totalReceived,
            totalExpenses,

            // A receber
            toReceive,
            toReceiveCash,
            toReceiveCard,
            toReceivePix
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Manter função original para compatibilidade
exports.getFinancialStats = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const where = {
            barbershopId,
            status: 'COMPLETED',
        };

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const [appointments, transactions] = await Promise.all([
            prisma.appointment.findMany({
                where,
                include: { service: true, professional: { select: { id: true, name: true } } }
            }),
            prisma.transaction.findMany({
                where: {
                    barbershopId,
                    date: where.date
                }
            })
        ]);

        const appointmentRevenue = appointments.reduce((acc, curr) => acc + Number(curr.service.price), 0);
        const otherIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalGrossRevenue = appointmentRevenue + otherIncome;

        const commissions = appointments.reduce((acc, curr) => {
            const proName = curr.professional.name;
            const value = Number(curr.service.price) * 0.5;
            acc[proName] = (acc[proName] || 0) + value;
            return acc;
        }, {});

        const totalCommissions = Object.values(commissions).reduce((acc, curr) => acc + curr, 0);
        const netProfit = totalGrossRevenue - totalCommissions - totalExpenses;

        res.json({
            totalRevenue: totalGrossRevenue,
            appointmentRevenue,
            otherIncome,
            totalExpenses,
            netProfit,
            totalAppointments: appointments.length,
            commissions: Object.entries(commissions).map(([name, value]) => ({ name, value })),
            appointments: appointments.slice(0, 10),
            transactions: transactions.slice(0, 10)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
