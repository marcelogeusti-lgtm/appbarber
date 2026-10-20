const prisma = require('../lib/prisma');

// Lista os cupons de uma barbearia
exports.list = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const coupons = await prisma.coupon.findMany({
            where: { barbershopId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(coupons);
    } catch (e) {
        console.error('Coupon list error:', e);
        res.status(500).json({ message: 'Erro ao carregar cupons.' });
    }
};

// Cria um cupom
exports.create = async (req, res) => {
    try {
        const { barbershopId, code, description, discountType, discountValue,
            minValue, maxUses, perClientLimit, validFrom, validUntil } = req.body;

        if (!barbershopId || !code || !discountValue) {
            return res.status(400).json({ message: 'Código, valor e barbearia são obrigatórios.' });
        }
        const type = discountType === 'FIXED' ? 'FIXED' : 'PERCENT';
        if (type === 'PERCENT' && Number(discountValue) > 100) {
            return res.status(400).json({ message: 'Desconto em % não pode passar de 100.' });
        }

        const coupon = await prisma.coupon.create({
            data: {
                barbershopId,
                code: String(code).trim().toUpperCase(),
                description: description || null,
                discountType: type,
                discountValue: Number(discountValue),
                minValue: minValue ? Number(minValue) : null,
                maxUses: maxUses ? Number(maxUses) : null,
                perClientLimit: perClientLimit ? Number(perClientLimit) : null,
                validFrom: validFrom ? new Date(validFrom) : null,
                validUntil: validUntil ? new Date(validUntil) : null
            }
        });
        res.status(201).json(coupon);
    } catch (e) {
        if (e.code === 'P2002') return res.status(400).json({ message: 'Já existe um cupom com esse código.' });
        console.error('Coupon create error:', e);
        res.status(500).json({ message: 'Erro ao criar cupom.' });
    }
};

// Atualiza / ativa-desativa um cupom
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = {};
        const fields = ['description', 'discountType', 'discountValue', 'minValue', 'maxUses', 'perClientLimit', 'active', 'validFrom', 'validUntil'];
        for (const f of fields) {
            if (req.body[f] === undefined) continue;
            if (['discountValue', 'minValue', 'maxUses', 'perClientLimit'].includes(f)) data[f] = req.body[f] === null || req.body[f] === '' ? null : Number(req.body[f]);
            else if (['validFrom', 'validUntil'].includes(f)) data[f] = req.body[f] ? new Date(req.body[f]) : null;
            else data[f] = req.body[f];
        }
        const coupon = await prisma.coupon.update({ where: { id }, data });
        res.json(coupon);
    } catch (e) {
        console.error('Coupon update error:', e);
        res.status(500).json({ message: 'Erro ao atualizar cupom.' });
    }
};

exports.remove = async (req, res) => {
    try {
        await prisma.coupon.delete({ where: { id: req.params.id } });
        res.json({ message: 'Cupom removido.' });
    } catch (e) {
        console.error('Coupon delete error:', e);
        res.status(500).json({ message: 'Erro ao remover cupom.' });
    }
};

// Conta quantas comandas (não canceladas) do cliente já usaram o cupom.
// Não há campo próprio: o uso fica registrado em order.notes como linha "Cupom: CODE".
exports.countClientUses = async (db, { barbershopId, clientId, code }) => {
    if (!clientId) return 0;
    const orders = await db.order.findMany({
        where: { barbershopId, clientId, status: { not: 'CANCELLED' }, notes: { contains: `Cupom: ${code}` } },
        select: { notes: true }
    });
    const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(^|\\n)Cupom: ' + escaped + '(\\r?\\n|$)');
    return orders.filter(o => re.test(o.notes || '')).length;
};

// Desconto do cupom sobre um valor (PERCENT/FIXED), nunca acima do valor, arredondado em centavos.
exports.computeDiscount = (coupon, amount) => {
    const raw = coupon.discountType === 'FIXED'
        ? coupon.discountValue
        : (amount * coupon.discountValue) / 100;
    return Math.round(Math.max(0, Math.min(raw, amount)) * 100) / 100;
};

// Regras compartilhadas (validate e aplicação na comanda).
// Retorna { ok: true, discount } ou { ok: false, status, message }.
exports.checkCoupon = async (db, coupon, { amount, clientId, barbershopId }) => {
    if (!coupon) return { ok: false, status: 404, message: 'Cupom não encontrado.' };
    if (!coupon.active) return { ok: false, status: 400, message: 'Cupom inativo.' };

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) return { ok: false, status: 400, message: 'Cupom ainda não começou.' };
    if (coupon.validUntil && now > coupon.validUntil) return { ok: false, status: 400, message: 'Cupom expirado.' };
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return { ok: false, status: 400, message: 'Cupom esgotado.' };
    if (coupon.minValue != null && amount < coupon.minValue) {
        return { ok: false, status: 400, message: `Valor mínimo de R$ ${coupon.minValue.toFixed(2)} para usar este cupom.` };
    }
    if (coupon.perClientLimit != null && clientId) {
        const uses = await exports.countClientUses(db, { barbershopId: barbershopId || coupon.barbershopId, clientId, code: coupon.code });
        if (uses >= coupon.perClientLimit) return { ok: false, status: 400, message: 'Este cliente já atingiu o limite de uso deste cupom.' };
    }
    return { ok: true, discount: exports.computeDiscount(coupon, amount) };
};

// Valida um cupom para um valor de compra e calcula o desconto
// Body/Query: barbershopId, code, amount, clientId?
exports.validate = async (req, res) => {
    try {
        const barbershopId = req.body.barbershopId || req.query.barbershopId;
        const code = req.body.code || req.query.code;
        const amount = Number(req.body.amount || req.query.amount || 0);
        const clientId = req.body.clientId || req.query.clientId || null;

        if (!barbershopId || !code) return res.status(400).json({ valid: false, message: 'Informe o código.' });

        const coupon = await prisma.coupon.findFirst({
            where: { barbershopId, code: String(code).trim().toUpperCase() }
        });
        const check = await exports.checkCoupon(prisma, coupon, { amount, clientId, barbershopId });
        if (!check.ok) return res.status(check.status).json({ valid: false, message: check.message });
        const discount = check.discount;

        res.json({
            valid: true,
            couponId: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discount,
            finalAmount: Math.round((amount - discount) * 100) / 100
        });
    } catch (e) {
        console.error('Coupon validate error:', e);
        res.status(500).json({ valid: false, message: 'Erro ao validar cupom.' });
    }
};

// Marca um uso (incrementa contador) — chamado ao fechar a comanda com cupom
exports.redeem = async (req, res) => {
    try {
        const { couponId } = req.body;
        if (!couponId) return res.status(400).json({ message: 'couponId obrigatório' });
        const coupon = await prisma.coupon.update({
            where: { id: couponId },
            data: { usedCount: { increment: 1 } }
        });
        res.json({ message: 'Uso registrado', usedCount: coupon.usedCount });
    } catch (e) {
        console.error('Coupon redeem error:', e);
        res.status(500).json({ message: 'Erro ao registrar uso do cupom.' });
    }
};
