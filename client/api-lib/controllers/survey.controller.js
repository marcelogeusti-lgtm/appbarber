const prisma = require('../lib/prisma');

// Submissão de resposta (público — via link) ou manual pelo painel
exports.submit = async (req, res) => {
    try {
        const { barbershopId, clientName, clientPhone, score, comment } = req.body || {};
        if (!barbershopId || typeof barbershopId !== 'string') {
            return res.status(400).json({ message: 'Barbearia é obrigatória.' });
        }
        const s = typeof score === 'string' && score.trim() !== '' ? Number(score) : score;
        if (!Number.isInteger(s) || s < 0 || s > 10) {
            return res.status(400).json({ message: 'A nota deve ser um número inteiro de 0 a 10.' });
        }
        if (comment != null && (typeof comment !== 'string' || comment.length > 1000)) {
            return res.status(400).json({ message: 'O comentário deve ter no máximo 1000 caracteres.' });
        }
        if (clientName != null && (typeof clientName !== 'string' || clientName.length > 120)) {
            return res.status(400).json({ message: 'Nome inválido.' });
        }
        if (clientPhone != null && (typeof clientPhone !== 'string' || clientPhone.length > 30)) {
            return res.status(400).json({ message: 'Telefone inválido.' });
        }

        const shop = await prisma.barbershop.findUnique({ where: { id: barbershopId }, select: { id: true } });
        if (!shop) return res.status(404).json({ message: 'Barbearia não encontrada.' });

        const row = await prisma.surveyResponse.create({
            data: {
                barbershopId,
                // clientId não é aceito: o endpoint é público e não há como provar quem respondeu
                clientId: null,
                clientName: clientName?.trim() || null,
                clientPhone: clientPhone?.trim() || null,
                score: s,
                comment: comment?.trim() || null
            }
        });
        res.status(201).json({ ok: true, id: row.id });
    } catch (e) {
        console.error('Survey submit error:', e);
        res.status(500).json({ message: 'Erro ao enviar a pesquisa.' });
    }
};

// Resultados/NPS para o painel
exports.getResults = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const where = { barbershopId };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) { const e = new Date(endDate); e.setHours(23, 59, 59, 999); where.createdAt.lte = e; }
        }

        const responses = await prisma.surveyResponse.findMany({ where, orderBy: { createdAt: 'desc' } });
        const total = responses.length;
        const promoters = responses.filter(r => r.score >= 9).length;
        const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
        const detractors = responses.filter(r => r.score <= 6).length;
        const nps = total ? Math.round(((promoters - detractors) / total) * 100) : 0;
        const avg = total ? (responses.reduce((s, r) => s + r.score, 0) / total) : 0;

        res.json({
            total, promoters, passives, detractors, nps,
            avg: Math.round(avg * 10) / 10,
            responses: responses.slice(0, 100)
        });
    } catch (e) {
        console.error('Survey results error:', e);
        res.status(500).json({ message: 'Erro ao carregar resultados.' });
    }
};
