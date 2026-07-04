const prisma = require('../lib/prisma');
const { startOfDay, endOfDay, eachDayOfInterval, format } = require('date-fns');

const parseBrazilianDate = (dateStr) => {
    if (!dateStr) return null;
    // If it's already an ISO string or YYYY-MM-DD
    if (dateStr.includes('-')) return new Date(dateStr);
    
    // Handle DD/MM/YYYY
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}T00:00:00`);
    }
    
    return new Date(dateStr);
};

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

        const start = parseBrazilianDate(startDate) || new Date(new Date().setDate(1)); // Primeiro dia do mês
        const end = parseBrazilianDate(endDate) || new Date(); // Hoje

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

        // Dynamic breakdown of pending values
        const toReceiveCash = openOrders
            .filter(o => o.paymentMethod === 'MONEY' || o.paymentMethod === 'CASH')
            .reduce((sum, o) => sum + (o.total || 0), 0);
        
        const toReceiveCard = openOrders
            .filter(o => o.paymentMethod === 'CREDIT_CARD' || o.paymentMethod === 'DEBIT_CARD' || o.paymentMethod === 'CARD')
            .reduce((sum, o) => sum + (o.total || 0), 0);
        
        const toReceivePix = openOrders
            .filter(o => o.paymentMethod === 'PIX')
            .reduce((sum, o) => sum + (o.total || 0), 0);
        
        const toReceiveOther = toReceive - (toReceiveCash + toReceiveCard + toReceivePix);
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
            toReceivePix,
            toReceiveOther
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

        const start = parseBrazilianDate(startDate) || new Date(new Date().setDate(1));
        const end = parseBrazilianDate(endDate) || new Date();

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
                select: { total: true, professionalId: true, professional: { select: { id: true, name: true } }, items: { select: { type: true, total: true } } }
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
            },
            include: {
                barber: { select: { name: true } }
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

        // Commissions calculation
        const commissions = commissionsRecords.reduce((acc, curr) => {
            // Group by professionalId if needed, but for summary we match the expected frontend format
            const proName = curr.barber?.name || 'Profissional';
            acc[proName] = (acc[proName] || 0) + curr.amount;
            return acc;
        }, {});

        // Standardized Breakdowns (Same as Dashboard)
        const revenueByMethod = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((acc, t) => {
                const method = t.paymentMethod || 'OUTROS';
                acc[method] = (acc[method] || 0) + Number(t.amount);
                return acc;
            }, {});

        const revenueByOrigin = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((acc, t) => {
                const origin = t.origin || 'NAO_IDENTIFICADO';
                acc[origin] = (acc[origin] || 0) + Number(t.amount);
                return acc;
            }, {});

        const revenueByBarber = transactions
            .filter(t => t.type === 'INCOME' && t.professionalId)
            .reduce((acc, t) => {
                const name = orders.find(o => o.professionalId === t.professionalId)?.professional?.name || 'Desconhecido';
                acc[name] = (acc[name] || 0) + Number(t.amount);
                return acc;
            }, {});

        res.json({
            totalRevenue: totalGrossRevenue,
            salesRevenue: salesRevenue,
            serviceRevenue,
            productRevenue,
            otherIncome,
            totalExpenses,
            netProfit,
            totalOrders: orders.length,
            totalCommissions: totalCommissions,
            commissions: Object.entries(commissions).map(([name, value]) => ({ name, value })),
            revenueByMethod,
            revenueByOrigin,
            revenueByBarber,
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

        const start = parseBrazilianDate(startDate) || new Date(new Date().setDate(1));
        const end = parseBrazilianDate(endDate) || new Date();

        const [transactions, orders] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    ...where,
                    date: { gte: startOfDay(start), lte: endOfDay(end) }
                },
                select: { amount: true, type: true, professionalId: true, professional: { select: { name: true } }, date: true }
            }),
            prisma.order.findMany({
                where: {
                    ...where,
                    status: { in: ['CLOSED', 'PAID'] },
                    updatedAt: { gte: startOfDay(start), lte: endOfDay(end) }
                },
                select: {
                    id: true,
                    total: true,
                    clientId: true,
                    updatedAt: true,
                    client: { select: { name: true } },
                    items: { select: { type: true, description: true, quantity: true, total: true } }
                }
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

        // Commissions from Commission Table (Pending/Paid)
        const commissionRecordsForPro = await prisma.commission.findMany({
            where: {
                barbershopId,
                createdAt: { gte: startOfDay(start), lte: endOfDay(end) }
            }
        });

        commissionRecordsForPro.forEach(c => {
            const id = c.barberId;
            if (!proStock[id]) proStock[id] = { name: 'Profissional', revenue: 0, commission: 0 };
            proStock[id].commission += Number(c.amount);
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
            select: { service: { select: { price: true } } }
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
            select: { professional: { select: { name: true } } }
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

exports.exportCSV = async (req, res) => {
    try {
        let { barbershopId, start, end, type = 'transactions' } = req.query;
        if (!barbershopId && req.user) barbershopId = req.user.barbershopId;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const where = { barbershopId };
        
        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            where.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        let headers = [];
        let csvContent = '';
        let filename = 'relatorio.csv';

        if (type === 'transactions') {
            const transactions = await prisma.transaction.findMany({
                where,
                include: { professional: { select: { name: true } } },
            });
            headers = ['Data', 'Tipo', 'Categoria', 'Metodo', 'Valor', 'Status', 'Descricao', 'Profissional'];
            csvContent = headers.join(';') + '\n';
            transactions.forEach(t => {
                const data = (t.createdAt.toLocaleDateString('pt-BR') + ' ' + t.createdAt.toLocaleTimeString('pt-BR')).replace(/;/g, ',');
                const tipo = t.type === 'INCOME' ? 'Entrada' : 'Saída';
                const cat = (t.category || '').replace(/;/g, ',');
                const metodo = (t.paymentMethod || t.origin || '').replace(/;/g, ',');
                const valor = t.amount ? Number(t.amount).toFixed(2).replace('.', ',') : '0,00';
                const status = (t.status || 'FINALIZADO').replace(/;/g, ',');
                const desc = (t.description || '').replace(/"/g, '""').replace(/;/g, ',');
                const pro = (t.professional ? t.professional.name : '').replace(/;/g, ',');
                csvContent += `"${data}";"${tipo}";"${cat}";"${metodo}";"${valor}";"${status}";"${desc}";"${pro}"\n`;
            });
            filename = 'transacoes_financeiras.csv';
        } else if (type === 'caixa') {
            const shifts = await prisma.cashShift.findMany({
                where,
                include: { openedBy: { select: { name: true } }, closedBy: { select: { name: true } } }
            });
            headers = ['Data Abertura', 'Aberto Por', 'Saldo Inicial', 'Data Fechamento', 'Fechado Por', 'Saldo Final', 'Status'];
            csvContent = headers.join(';') + '\n';
            shifts.forEach(s => {
                const dataAbertura = (s.openedAt.toLocaleDateString('pt-BR') + ' ' + s.openedAt.toLocaleTimeString('pt-BR')).replace(/;/g, ',');
                const abertoPor = (s.openedBy ? s.openedBy.name : '').replace(/;/g, ',');
                const saldoInicial = s.openingBalance ? Number(s.openingBalance).toFixed(2).replace('.', ',') : '0,00';
                const dataFechamento = s.closedAt ? (s.closedAt.toLocaleDateString('pt-BR') + ' ' + s.closedAt.toLocaleTimeString('pt-BR')).replace(/;/g, ',') : '';
                const fechadoPor = (s.closedBy ? s.closedBy.name : '').replace(/;/g, ',');
                const saldoFinal = s.closingBalance ? Number(s.closingBalance).toFixed(2).replace('.', ',') : s.currentBalance ? Number(s.currentBalance).toFixed(2).replace('.', ',') : '0,00';
                const status = (s.status === 'OPEN' ? 'ABERTO' : 'FECHADO').replace(/;/g, ',');
                csvContent += `"${dataAbertura}";"${abertoPor}";"${saldoInicial}";"${dataFechamento}";"${fechadoPor}";"${saldoFinal}";"${status}"\n`;
            });
            filename = 'historico_caixas.csv';
        } else if (type === 'commissions') {
            const commissions = await prisma.commission.findMany({
                where,
                include: { barber: { select: { name: true } } }
            });
            headers = ['Data', 'Profissional', 'Tipo', 'Valor', 'Status'];
            csvContent = headers.join(';') + '\n';
            commissions.forEach(c => {
                const data = (c.createdAt.toLocaleDateString('pt-BR') + ' ' + c.createdAt.toLocaleTimeString('pt-BR')).replace(/;/g, ',');
                const pro = (c.barber ? c.barber.name : '').replace(/;/g, ',');
                const tipo = (c.type || 'SERVICE').replace(/;/g, ',');
                const valor = c.amount ? Number(c.amount).toFixed(2).replace('.', ',') : '0,00';
                const status = (c.status === 'PAID' ? 'PAGO' : 'PENDENTE').replace(/;/g, ',');
                csvContent += `"${data}";"${pro}";"${tipo}";"${valor}";"${status}"\n`;
            });
            filename = 'comissoes.csv';
        }

        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment(filename);
        return res.send(Buffer.from('\uFEFF' + csvContent, 'utf-8'));
    } catch (error) {
        console.error('Export erro:', error);
        res.status(500).json({ message: 'Erro ao exportar planilha CSV' });
    }
};
