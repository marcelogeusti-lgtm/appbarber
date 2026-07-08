const prisma = require('../lib/prisma');
const { startOfDay, endOfDay } = require('date-fns');

const parseBrazilianDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes('-')) return new Date(dateStr);
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}T00:00:00`);
    }
    return new Date(dateStr);
};

// Relatório de Comissões por Barbeiro
exports.getCommissionsReport = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const start = parseBrazilianDate(startDate) || new Date(new Date().setDate(1));
        const end = parseBrazilianDate(endDate) || new Date();

        // Buscar todos os colaboradores da barbearia (independente de role, se estiverem vinculados ao shop)
        const barbers = await prisma.user.findMany({
            where: {
                workedBarbershopId: barbershopId
            },
            select: {
                id: true,
                name: true
            }
        });

        // Buscar agendamentos e comandas completas no período
        const [appointments, orders] = await Promise.all([
            prisma.appointment.findMany({
                where: {
                    barbershopId,
                    status: 'COMPLETED',
                    date: { gte: startOfDay(start), lte: endOfDay(end) }
                },
                include: { service: true, professional: { select: { id: true, name: true } } }
            }),
            prisma.order.findMany({
                where: {
                    barbershopId,
                    status: { in: ['CLOSED', 'PAID'] },
                    paidAt: { gte: startOfDay(start), lte: endOfDay(end) }
                },
                include: { 
                    items: { include: { service: true, product: true } }, 
                    professional: { select: { id: true, name: true } } 
                }
            })
        ]);

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
            // Agendamentos e Comandas do barbeiro
            const barberAppointments = appointments.filter(apt => apt.professionalId === barber.id);
            const barberOrders = orders.filter(ord => ord.professionalId === barber.id);

            // Vendas totais (Soma de Appointments + Comandas)
            const aptSales = barberAppointments.reduce((sum, apt) => sum + Number(apt.service.price), 0);
            const ordSales = barberOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);
            const totalSales = aptSales + ordSales;

            // Total de serviços
            const aptServices = barberAppointments.reduce((sum, apt) => sum + Number(apt.service.price), 0);
            const ordServices = barberOrders.reduce((sum, ord) => {
                const items = ord.items || [];
                return sum + items.filter(i => i.type === 'SERVICE').reduce((s, i) => s + i.total, 0);
            }, 0);
            const totalServices = aptServices + ordServices;
            
            // Note: Volume Bruto (Gross) usually refers to totalSales in this context
            const totalGrossVolume = totalSales;

            // Fetch stored commissions for this barber
            const barberCommissions = commissions.filter(c => c.barberId === barber.id);

            // Comissão por serviços (From Commission Table)
            const serviceCommission = barberCommissions
                .filter(c => c.type === 'SERVICE')
                .reduce((sum, c) => sum + Number(c.amount), 0);

            // Comissões de produtos
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

            // Compras de produto (débito) - negativos que NÃO são adiantamento
            const productPurchases = barberCommissions
                .filter(c => c.amount < 0 && c.type !== 'ADVANCE')
                .reduce((sum, c) => sum + Math.abs(Number(c.amount)), 0);

            // Vales / Adiantamentos já entregues (registrados como comissão negativa tipo ADVANCE)
            const advancesTaken = barberCommissions
                .filter(c => c.type === 'ADVANCE')
                .reduce((sum, c) => sum + Math.abs(Number(c.amount)), 0);

            // Total de comissões (Líquido) — desconta compras de produto e adiantamentos
            const totalCommissions = serviceCommission + productCommission + subscriptionCommission + extras - productPurchases - advancesTaken;

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
                totalGrossVolume,
                serviceCommission,
                productCommission,
                subscriptionCommission,
                extras,
                productPurchases,
                advancesTaken,
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
            totalPendingCommissions: barberStats.reduce((sum, b) => sum + b.pendingCommissions, 0),
            totalAdvances: barberStats.reduce((sum, b) => sum + (b.advancesTaken || 0), 0)
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

        // 1. Get total pending amount to record as expense
        const pendingCommissions = await prisma.commission.findMany({
            where: {
                barberId,
                barbershopId,
                status: 'PENDING'
            }
        });

        if (pendingCommissions.length === 0) {
            return res.status(400).json({ message: 'Não há comissões pendentes para este profissional.' });
        }

        const totalToPay = pendingCommissions.reduce((sum, c) => sum + Number(c.amount), 0);

        // Se o líquido for zero ou negativo, o profissional já recebeu adiantado de mais:
        // não há repasse a fazer (o saldo negativo é abatido nas próximas comissões).
        if (totalToPay <= 0) {
            return res.status(400).json({
                message: 'Não há saldo a pagar. O profissional está com adiantamento a compensar em comissões futuras.'
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 2. Update status
            await tx.commission.updateMany({
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

            // 3. Create expense transaction
            const pro = await tx.user.findUnique({ where: { id: barberId }, select: { name: true } });

            await financialService.recordExpense({
                amount: totalToPay,
                description: `Pagamento Comissão: ${pro?.name || 'Profissional'}`,
                category: 'Comissão',
                barbershopId,
                professionalId: barberId,
                paymentMethod: 'CASH' // Default for payouts
            });

            return totalToPay;
        });

        res.json({
            message: 'Comissões pagas com sucesso',
            amountPaid: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Criar comissão manual
// Dar um Vale / Adiantamento ao profissional (abate das comissões futuras)
exports.giveAdvance = async (req, res) => {
    try {
        const { barberId, barbershopId, amount, note } = req.body;
        const value = Number(amount);

        if (!barberId || !barbershopId || !value || value <= 0) {
            return res.status(400).json({ message: 'Informe um valor de adiantamento válido.' });
        }

        const pro = await prisma.user.findUnique({ where: { id: barberId }, select: { name: true } });

        await prisma.$transaction(async (tx) => {
            // 1. Registra o vale como comissão NEGATIVA (tipo ADVANCE), pendente:
            //    reduz o saldo a receber; se passar do acumulado, vira saldo negativo
            //    que as próximas comissões abatem.
            await tx.commission.create({
                data: {
                    barberId,
                    barbershopId,
                    type: 'ADVANCE',
                    description: note ? `Vale/Adiantamento — ${note}` : 'Vale/Adiantamento',
                    amount: -Math.abs(value),
                    percentage: null,
                    status: 'PENDING'
                }
            });

            // 2. Lança a despesa (dinheiro que saiu do caixa agora)
            await financialService.recordExpense({
                amount: value,
                description: `Vale/Adiantamento: ${pro?.name || 'Profissional'}`,
                category: 'Comissão',
                barbershopId,
                professionalId: barberId,
                paymentMethod: 'CASH'
            });
        });

        res.json({ message: 'Vale registrado com sucesso', amount: value });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar o vale.' });
    }
};

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
