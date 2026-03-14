const prisma = require('../lib/prisma');
const { startOfDay, endOfDay, eachDayOfInterval, format } = require('date-fns');

// Dashboard Financeiro Completo
exports.getFinancialDashboard = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;

        // Validation / Governance Logic
        let where = {};

        // 1. If ID provided, filter by it (enforced by middleware for non-admins)
        if (barbershopId) {
            where.barbershopId = barbershopId;
        }
        // 2. If NO ID provided:
        else {
            // Only SUPER_ADMIN can see "All"
            if (req.user.role !== 'SUPER_ADMIN') {
                return res.status(400).json({ message: 'Barbershop ID required for this user role.' });
            }
            // SUPER_ADMIN with no ID = Global View (empty where.barbershopId)
        }

        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // Primeiro dia do mês
        const end = endDate ? new Date(endDate) : new Date(); // Hoje

        // 1. Single Source of Truth for Finance: TRANSACTIONS
        const transactions = await prisma.transaction.findMany({
            where: {
                ...where,
                date: {
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            },
            include: { professional: { select: { name: true } } },
            orderBy: { date: 'asc' }
        });

        // 2. Operational Metrics (Clients, etc.) - Can still use Orders but only for counts
        // 2. Operational Metrics (Clients, etc.) - Can still use Orders but only for counts
        const orders = await prisma.order.findMany({
            where: {
                ...where,
                status: { in: ['CLOSED', 'PAID'] },
                updatedAt: {
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            },
            select: { clientId: true, updatedAt: true } // Performance optimization
        });

        // --- CALCULATIONS based on TRANSACTIONS ---

        // Revenue (Entradas)
        const totalRevenue = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // Expenses (Saídas)
        const totalExpenses = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // Balance (Saldo)
        const balance = totalRevenue - totalExpenses;

        // Graph Data: Revenue by Day
        const daysInterval = eachDayOfInterval({ start, end });
        const revenueByDay = daysInterval.map(day => {
            const dayStr = format(day, 'dd/MM');
            // Filter transactions for this day
            const dayTransactions = transactions.filter(t =>
                t.type === 'INCOME' &&
                format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );
            const dayRevenue = dayTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
            return { date: dayStr, value: dayRevenue };
        });

        // --- OPERATIONAL METRICS ---
        const totalClients = new Set(orders.map(o => o.clientId)).size;
        const avgClientsPerDay = daysInterval.length > 0 ? (totalClients / daysInterval.length).toFixed(1) : 0;

        // Comandas em aberto (Status OPEN)
        const openOrders = await prisma.order.findMany({
            where: {
                ...where,
                status: 'OPEN',
            },
            select: { total: true }
        });

        const totalOpenCommands = openOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        // Valores a receber (Agendamentos futuros)
        // Valores a receber (Agendamentos futuros)
        const futureAppointments = await prisma.appointment.findMany({
            where: {
                ...where,
                status: 'CONFIRMED',
                date: { gte: new Date() },
                order: null
            },
            include: { service: true }
        });

        const futureRevenue = futureAppointments.reduce((sum, apt) => sum + Number(apt.service.price), 0);
        const toReceive = totalOpenCommands + futureRevenue;

        // --- BREAKDOWNS ---
        
        // Note: 'toReceiveCash/Card/Pix' were previously hardcoded estimates (placebos).
        // Removing them to ensure only real data is shown.
        const toReceiveCash = 0;
        const toReceiveCard = 0;
        const toReceivePix = 0;

        // --- BREAKDOWNS ---

        // By Method
        const revenueByMethod = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((acc, t) => {
                const method = t.paymentMethod || 'OUTROS';
                acc[method] = (acc[method] || 0) + Number(t.amount);
                return acc;
            }, {});

        // By Origin
        const revenueByOrigin = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((acc, t) => {
                const origin = t.origin || 'NAO_IDENTIFICADO';
                acc[origin] = (acc[origin] || 0) + Number(t.amount);
                return acc;
            }, {});

        // By Barber (need professional name? Transaction has professionalId, need to map)
        // We can fetch professionals or just group by ID for now, or if we want names we need to include them in the query above.
        // Let's rely on Orders for Barber breakdown? No, Transactions have professionalId now.
        // But we didn't include 'professional' in the Transaction query.
        // Let's just return by ID for frontend to map, or we update the query.

        // Let's update the transaction query to include professional (optional, might be heavy if many)
        // Or better: Use the existing logic where we have orders.
        // But we want ALL transactions.

        // By Barber
        const revenueByBarber = transactions
            .filter(t => t.type === 'INCOME' && t.professionalId)
            .reduce((acc, t) => {
                const name = t.professional?.name || 'Desconhecido';
                acc[name] = (acc[name] || 0) + Number(t.amount);
                return acc;
            }, {});


        res.json({
            revenueByDay,
            revenueByMethod,
            revenueByOrigin,
            revenueByBarber,
            totalRevenue,
            totalClients,
            avgClientsPerDay,
            openCommands: openOrders.length,
            totalOpenCommands,
            balance,
            totalReceived: totalRevenue, // Explicit naming
            totalExpenses,
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

        // Governance Logic
        let where = {};
        if (barbershopId) {
            where.barbershopId = barbershopId;
        } else {
            if (req.user.role !== 'SUPER_ADMIN') {
                return res.status(400).json({ message: 'Barbershop ID required' });
            }
        }

        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
        const end = endDate ? new Date(endDate) : new Date();

        const [orders, transactions] = await Promise.all([
            prisma.order.findMany({
                where: {
                    ...where,
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
                    professional: { select: { id: true, name: true, commissionPercent: true } },
                    client: true
                }
            }),
            prisma.transaction.findMany({
                where: {
                    ...where,
                    date: {
                        gte: startOfDay(start),
                        lte: endOfDay(end)
                    }
                }
            })
        ]);

        // Receita Bruta (Vem das Orders para detalhamento, mas Total deve bater com Transactions)
        // Adjust logic: Use Transactions for totals, Orders for breakdown
        const totalGrossRevenue = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const salesRevenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0); // Might differ if manual transactions exist

        // Outras Receitas (Transactions do tipo INCOME que NÃO têm OrderId)
        const otherIncome = transactions.filter(t => t.type === 'INCOME' && !t.orderId).reduce((acc, curr) => acc + Number(curr.amount), 0);

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

        // Comissões Reais (Lidas da tabela Commission)
        const commissionsRecords = await prisma.commission.findMany({
            where: {
                barbershopId,
                createdAt: {
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            }
        });

        const totalCommissions = commissionsRecords.reduce((acc, curr) => acc + curr.amount, 0);

        // Breakdown de comissões por profissional
        const commissionsByPro = commissionsRecords.reduce((acc, curr) => {
            // We'd need to link barber name here if we want names, but for summary we can just show total
            return acc + curr.amount;
        }, 0);

        // Lucro Líquido Real: Baseado em todas as entradas e saídas (incluindo comissões pagas e outras despesas)
        const netProfit = totalGrossRevenue - totalExpenses;
        // Note: totalExpenses already includes paid commissions if they were recorded as Expense transactions.

        res.json({
            totalRevenue: totalGrossRevenue,
            salesRevenue: salesRevenue,
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

// --- MODO DONO: INTELIGÊNCIA DE NEGÓCIO ---
exports.getOwnerDashboard = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;
        let where = {};
        if (barbershopId) where.barbershopId = barbershopId;

        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
        const end = endDate ? new Date(endDate) : new Date();

        const [transactions, orders] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    ...where,
                    date: { gte: startOfDay(start), lte: endOfDay(end) }
                },
                include: { professional: { select: { name: true } } }
            }),
            prisma.order.findMany({
                where: {
                    ...where,
                    status: { in: ['CLOSED', 'PAID'] },
                    updatedAt: { gte: startOfDay(start), lte: endOfDay(end) }
                },
                include: { items: true, client: true }
            })
        ]);

        // 1. KPIs Básicos
        const totalRevenue = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
        const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
        const netProfit = totalRevenue - totalExpenses;
        const ticketMedio = orders.length > 0 ? (totalRevenue / orders.length) : 0;
        const monthlyRevenue = totalRevenue || 0;

        // 2. Retenção de Clientes
        const clientVisitCount = orders.reduce((acc, o) => {
            if (o.clientId) acc[o.clientId] = (acc[o.clientId] || 0) + 1;
            return acc;
        }, {});
        const recurringClients = Object.values(clientVisitCount).filter(count => count > 1).length;
        const totalClientsInPeriod = Object.keys(clientVisitCount).length;
        const retentionRate = totalClientsInPeriod > 0 ? (recurringClients / totalClientsInPeriod) * 100 : 0;
        const monthlyVisitRate = totalClientsInPeriod;

        // 3. Lucro por Profissional (Revenue - Commissions)
        const proStock = {}; // { proId: { name, revenue, commission, net } }

        // Revenue from Transactions (mapped to pros)
        transactions.filter(t => t.type === 'INCOME' && t.professionalId).forEach(t => {
            const id = t.professionalId;
            if (!proStock[id]) proStock[id] = { name: t.professional?.name || 'Desconhecido', revenue: 0, commission: 0 };
            proStock[id].revenue += Number(t.amount);
        });

        // Commissions from Transactions (mapped to pros as expense)
        transactions.filter(t => t.type === 'EXPENSE' && t.category === 'Comissão' && t.professionalId).forEach(t => {
            const id = t.professionalId;
            if (!proStock[id]) proStock[id] = { name: t.professional?.name || 'Desconhecido', revenue: 0, commission: 0 };
            proStock[id].commission += Number(t.amount);
        });

        const rankingPro = Object.values(proStock).map(p => ({
            ...p,
            net: p.revenue - p.commission
        })).sort((a, b) => b.net - a.net);

        // 4. Horários Mais Lucrativos (Heatmap data)
        const hourlyRevenue = orders.reduce((acc, o) => {
            const hour = new Date(o.updatedAt).getHours();
            acc[hour] = (acc[hour] || 0) + Number(o.total);
            return acc;
        }, {});

        // 5. Serviços Mais Rentáveis
        const serviceStats = {};
        orders.forEach(o => {
            o.items.filter(i => i.type === 'SERVICE').forEach(i => {
                const name = i.description || 'Serviço';
                if (!serviceStats[name]) serviceStats[name] = { count: 0, revenue: 0 };
                serviceStats[name].count += i.quantity;
                serviceStats[name].revenue += Number(i.total);
            });
        });
        const topServices = Object.entries(serviceStats).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.revenue - a.revenue);

        // 6. Clientes VIP (Top Spenders)
        const clientRanking = orders.reduce((acc, o) => {
            const name = o.client?.name || 'Avulso';
            if (!acc[name]) acc[name] = 0;
            acc[name] += Number(o.total);
            return acc;
        }, {});
        const topClients = Object.entries(clientRanking).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, 10);

        // 7. Previsão de Faturamento (Próximos 30 dias de agendamentos confirmados)
        const futureApts = await prisma.appointment.findMany({
            where: {
                ...where,
                status: 'CONFIRMED',
                date: { gte: new Date(), lte: new Date(new Date().setDate(new Date().getDate() + 30)) }
            },
            include: { service: true }
        });
        const forecast = futureApts.reduce((sum, a) => sum + Number(a.service?.price || 0), 0);

        // 8. Inteligência: Alertas Automáticos
        const alerts = [];

        // Alerta 1: Queda de Movimento (Comparar última semana vs penúltima)
        const last7Days = transactions.filter(t => t.type === 'INCOME' && t.date >= new Date(new Date().setDate(new Date().getDate() - 7)));
        const prev7To14Days = await prisma.transaction.findMany({
            where: {
                ...where,
                type: 'INCOME',
                date: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 14)),
                    lte: new Date(new Date().setDate(new Date().getDate() - 7))
                }
            }
        });
        const revLast7 = last7Days.reduce((s, t) => s + Number(t.amount), 0);
        const revPrev7 = prev7To14Days.reduce((s, t) => s + Number(t.amount), 0);

        if (revPrev7 > 0 && revLast7 < revPrev7 * 0.8) {
            alerts.push({
                type: 'WARNING',
                title: 'Queda de faturamento',
                message: `O movimento caiu ${((1 - revLast7 / revPrev7) * 100).toFixed(0)}% em relação à semana passada.`
            });
        }

        // Alerta 2: Cancelamentos Frequentes
        const recentCancellations = await prisma.appointment.findMany({
            where: {
                ...where,
                status: 'CANCELLED',
                updatedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
            },
            include: { professional: { select: { name: true } } }
        });

        const cancelByPro = recentCancellations.reduce((acc, a) => {
            const name = a.professional?.name || 'Pro';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        Object.entries(cancelByPro).forEach(([name, count]) => {
            if (count >= 3) {
                alerts.push({
                    type: 'DANGER',
                    title: 'Foco em Cancelamentos',
                    message: `O profissional ${name} teve ${count} cancelamentos nos últimos 7 dias.`
                });
            }
        });

        // Alerta 3: Horários Ociosos (ex: 14h sempre vazio)
        if (Object.keys(hourlyRevenue).length > 0 && !hourlyRevenue[14]) {
            alerts.push({
                type: 'INFO',
                title: 'Horário Ocioso',
                message: 'O horário das 14h está sem faturamento neste período. Que tal uma promoção?'
            });
        }

        res.json({
            kpis: {
                monthlyRevenue,
                estimatedProfit: netProfit,
                ticketMedio,
                retentionRate,
                forecast,
                visitCount: monthlyVisitRate
            },
            rankings: {
                professionals: rankingPro,
                services: topServices,
                clients: topClients
            },
            charts: {
                hourlyHeatmap: Object.entries(hourlyRevenue).map(([hour, value]) => ({ hour: parseInt(hour), value })),
                revenueGrowth: []
            },
            alerts
        });

    } catch (error) {
        console.error('Owner Dashboard Error:', error);
        res.status(500).json({ message: 'Erro ao processar inteligência de negócio.' });
    }
};

// --- Cash Shift (Caixa) Management ---

exports.getCurrentShift = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const currentShift = await prisma.cashShift.findFirst({
            where: {
                barbershopId,
                status: 'OPEN'
            },
            include: {
                openedBy: { select: { name: true } }
            }
        });

        res.json(currentShift);
    } catch (error) {
        console.error('Get Current Shift Error:', error);
        res.status(500).json({ message: 'Erro ao buscar status do caixa.' });
    }
};

exports.openShift = async (req, res) => {
    try {
        const { barbershopId, openingBalance = 0 } = req.body;
        const userId = req.user.id;

        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        // Check if there is already an open shift
        const existing = await prisma.cashShift.findFirst({
            where: { barbershopId, status: 'OPEN' }
        });

        if (existing) {
            return res.status(400).json({ message: 'Já existe um caixa aberto para esta barbearia.' });
        }

        const newShift = await prisma.cashShift.create({
            data: {
                barbershopId,
                openedById: userId,
                openingBalance: parseFloat(openingBalance),
                currentBalance: parseFloat(openingBalance),
                status: 'OPEN'
            }
        });

        res.status(201).json(newShift);
    } catch (error) {
        console.error('Open Shift Error:', error);
        res.status(500).json({ message: 'Erro ao abrir caixa.' });
    }
};

exports.closeShift = async (req, res) => {
    try {
        const { barbershopId, closingBalance } = req.body;
        const userId = req.user.id;

        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const currentShift = await prisma.cashShift.findFirst({
            where: { barbershopId, status: 'OPEN' }
        });

        if (!currentShift) {
            return res.status(400).json({ message: 'Não há caixa aberto para fechar.' });
        }

        const updatedShift = await prisma.cashShift.update({
            where: { id: currentShift.id },
            data: {
                status: 'CLOSED',
                closedById: userId,
                closedAt: new Date(),
                closingBalance: closingBalance !== undefined ? parseFloat(closingBalance) : currentShift.currentBalance
            }
        });

        res.json(updatedShift);
    } catch (error) {
        console.error('Close Shift Error:', error);
        res.status(500).json({ message: 'Erro ao fechar caixa.' });
    }
};
