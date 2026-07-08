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
        if (!coupon) return res.status(404).json({ valid: false, message: 'Cupom não encontrado.' });
        if (!coupon.active) return res.status(400).json({ valid: false, message: 'Cupom inativo.' });

        const now = new Date();
        if (coupon.validFrom && now < coupon.validFrom) return res.status(400).json({ valid: false, message: 'Cupom ainda não começou.' });
        if (coupon.validUntil && now > coupon.validUntil) return res.status(400).json({ valid: false, message: 'Cupom expirado.' });
        if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ valid: false, message: 'Cupom esgotado.' });
        if (coupon.minValue != null && amount < coupon.minValue) {
            return res.status(400).json({ valid: false, message: `Valor mínimo de R$ ${coupon.minValue.toFixed(2)} para usar este cupom.` });
        }

        const discount = coupon.discountType === 'FIXED'
            ? Math.min(coupon.discountValue, amount)
            : (amount * coupon.discountValue) / 100;

        res.json({
            valid: true,
            couponId: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discount: Math.round(discount * 100) / 100,
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
