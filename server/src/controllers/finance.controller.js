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

        // Buscar Comandas (Orders) Fechadas/Pagas no período
        const orders = await prisma.order.findMany({
            where: {
                barbershopId,
                status: { in: ['CLOSED', 'PAID'] }, // Apenas pagas
                updatedAt: { // Considerar a data de fechamento/pagamento
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            },
            include: {
                items: {
                    include: {
                        service: true,
                        product: true
                    }
                },
                client: { select: { id: true, name: true } }
            }
        });

        // Buscar transações (despesas e outras receitas manuais não atreladas a orders)
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
            const dayOrders = orders.filter(order =>
                format(new Date(order.updatedAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );
            const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
            return { date: dayStr, value: dayRevenue };
        });

        // KPIs
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalClients = new Set(orders.map(order => order.clientId)).size;
        // Evitar divisão por zero se daysInterval for vazio (embora improvável com a lógica atual)
        const avgClientsPerDay = daysInterval.length > 0 ? (orders.length / daysInterval.length).toFixed(1) : 0;

        // Comandas em aberto (Status OPEN)
        const openOrders = await prisma.order.findMany({
            where: {
                barbershopId,
                status: 'OPEN',
            },
            include: {
                items: true
            }
        });

        const totalOpenCommands = openOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        // Despesas
        const totalExpenses = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // Saldo
        const totalReceived = totalRevenue;
        const balance = totalReceived - totalExpenses;

        // Valores a receber (Agendamentos futuros CONFIRMADOS que ainda NÃO têm comanda ou comanda OPEN)
        const futureAppointments = await prisma.appointment.findMany({
            where: {
                barbershopId,
                status: 'CONFIRMED',
                date: { gte: new Date() },
                order: null // Apenas os que não geraram comanda ainda
            },
            include: { service: true }
        });

        const futureRevenue = futureAppointments.reduce((sum, apt) => sum + Number(apt.service.price), 0);

        // Total a receber = Comandas Abertas + Agendamentos Futuros (sem comanda)
        const toReceive = totalOpenCommands + futureRevenue;

        // Dividir valores a receber por método de pagamento (simulado/estimado ou baseado no histórico)
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
            openCommands: openOrders.length, // Quantidade de comandas abertas
            totalOpenCommands, // Valor monetário

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
        console.error('Financial Dashboard Error:', error);
        res.status(500).json({ message: 'Erro ao carregar dashboard financeiro.', error: error.message });
    }
};

// Manter função de estatísticas detalhadas (atualizada para usar Orders)
exports.getFinancialStats = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
        const end = endDate ? new Date(endDate) : new Date();

        const [orders, transactions] = await Promise.all([
            prisma.order.findMany({
                where: {
                    barbershopId,
                    status: { in: ['CLOSED', 'PAID'] },
                    updatedAt: {
                        gte: startOfDay(start),
                        lte: endOfDay(end)
                    }
                },
                include: {
                    items: {
                        include: {
                            service: true,
                            product: true
                        }
                    },
                    professional: { select: { id: true, name: true } },
                    client: true
                }
            }),
            prisma.transaction.findMany({
                where: {
                    barbershopId,
                    date: {
                        gte: startOfDay(start),
                        lte: endOfDay(end)
                    }
                }
            })
        ]);

        // Receita Bruta (Vem das Orders)
        const totalGrossRevenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);

        // Outras Receitas (Transactions do tipo INCOME)
        const otherIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + Number(curr.amount), 0);

        // Despesas (Transactions do tipo EXPENSE)
        const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + Number(curr.amount), 0);

        // Breakdown de Receita: Serviços vs Produtos
        let serviceRevenue = 0;
        let productRevenue = 0;

        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.type === 'SERVICE') serviceRevenue += item.total;
                if (item.type === 'PRODUCT') productRevenue += item.total;
            });
        });

        // Comissões (Estimativa: 50% apenas sobre SERVIÇOS)
        const commissions = {};

        orders.forEach(order => {
            const proName = order.professional?.name || 'Desconhecido';
            // Calcular comissão baseada nos itens de serviço da ordem
            const orderServiceTotal = order.items
                .filter(i => i.type === 'SERVICE')
                .reduce((sum, i) => sum + i.total, 0);

            const commissionValue = orderServiceTotal * 0.5; // 50%

            commissions[proName] = (commissions[proName] || 0) + commissionValue;
        });

        const totalCommissions = Object.values(commissions).reduce((acc, curr) => acc + curr, 0);

        // Lucro Líquido
        const netProfit = (totalGrossRevenue + otherIncome) - totalCommissions - totalExpenses;

        res.json({
            totalRevenue: totalGrossRevenue + otherIncome, // Soma tudo
            salesRevenue: totalGrossRevenue, // Apenas vendas (orders)
            serviceRevenue,
            productRevenue,
            otherIncome,
            totalExpenses,
            netProfit,
            totalOrders: orders.length,
            commissions: Object.entries(commissions).map(([name, value]) => ({ name, value })),
            orders: orders.slice(0, 10), // Últimas 10
            transactions: transactions.slice(0, 10)
        });
    } catch (error) {
        console.error('Financial Stats Error:', error);
        res.status(500).json({ message: 'Server error loading stats.' });
    }
};
