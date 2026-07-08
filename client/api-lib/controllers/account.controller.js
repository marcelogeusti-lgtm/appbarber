const prisma = require('../lib/prisma');

// Saldo de todos os clientes com conta aberta (deve = CHARGE - PAYMENT)
exports.getBalances = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const entries = await prisma.clientAccountEntry.findMany({
            where: { barbershopId },
            orderBy: { createdAt: 'desc' }
        });

        const map = {};
        for (const e of entries) {
            map[e.clientId] = map[e.clientId] || { clientId: e.clientId, clientName: e.clientName, balance: 0, lastAt: e.createdAt };
            map[e.clientId].balance += e.type === 'CHARGE' ? e.amount : -e.amount;
        }
        const clients = Object.values(map).sort((a, b) => b.balance - a.balance);
        const totalOwed = clients.reduce((s, c) => s + (c.balance > 0 ? c.balance : 0), 0);

        res.json({ clients, totalOwed });
    } catch (e) {
        console.error('Account balances error:', e);
        res.status(500).json({ message: 'Erro ao carregar contas.' });
    }
};

// Extrato de um cliente
exports.getStatement = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        const { clientId } = req.params;
        const entries = await prisma.clientAccountEntry.findMany({
            where: { barbershopId, clientId },
            orderBy: { createdAt: 'desc' }
        });
        const balance = entries.reduce((s, e) => s + (e.type === 'CHARGE' ? e.amount : -e.amount), 0);
        res.json({ entries, balance });
    } catch (e) {
        console.error('Account statement error:', e);
        res.status(500).json({ message: 'Erro ao carregar extrato.' });
    }
};

// Lança um valor na conta (dívida) ou registra um pagamento (entra no caixa)
exports.addEntry = async (req, res) => {
    try {
        const { barbershopId, clientId, type, amount, description, paymentMethod } = req.body;
        const value = Number(amount);
        const method = ['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD'].includes(paymentMethod) ? paymentMethod : 'CASH';
        if (!barbershopId || !clientId || !value || value <= 0 || !['CHARGE', 'PAYMENT'].includes(type)) {
            return res.status(400).json({ message: 'Dados inválidos.' });
        }
        const client = await prisma.client.findUnique({ where: { id: clientId }, select: { name: true } });
        if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });

        const result = await prisma.$transaction(async (tx) => {
            const entry = await tx.clientAccountEntry.create({
                data: {
                    barbershopId, clientId, clientName: client.name,
                    type, amount: value,
                    description: description || (type === 'CHARGE' ? 'Consumo na conta' : 'Pagamento de conta')
                }
            });

            // Pagamento de fiado = dinheiro que entra no caixa
            if (type === 'PAYMENT') {
                await tx.transaction.create({
                    data: {
                        description: `Recebimento de conta (fiado): ${client.name}`,
                        amount: value,
                        type: 'INCOME',
                        category: 'Fiado',
                        barbershopId,
                        paymentMethod: method,
                        origin: 'PRESENCIAL',
                        date: new Date()
                    }
                });
            }
            return entry;
        });

        res.status(201).json(result);
    } catch (e) {
        console.error('Account addEntry error:', e);
        res.status(500).json({ message: 'Erro ao lançar na conta.' });
    }
};
