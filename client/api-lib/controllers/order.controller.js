const prisma = require('../lib/prisma');

// Create new Order (linked to Appointment or Manual/Balcão)
exports.createOrder = async (req, res) => {
    try {
        const {
            appointmentId,
            barbershopId,
            clientId: propClientId,
            professionalId,
            isManual,
            guestName,
            guestPhone,
            serviceIds = [] // Support multiple services for manual flow
        } = req.body;

        let clientId = propClientId;

        // 1. Check if order already exists for this appointment (if provided)
        if (appointmentId) {
            const existing = await prisma.order.findUnique({
                where: { appointmentId }
            });
            if (existing) {
                return res.status(200).json(existing);
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            // 2. Handle Guest Client for Manual flow
            if (isManual && !clientId && guestName) {
                // Find or create client by phone
                const phone = guestPhone ? guestPhone.replace(/\D/g, '') : null;
                let client = null;
                if (phone) {
                    client = await tx.client.findUnique({ where: { phone } });
                }

                if (!client) {
                    client = await tx.client.create({
                        data: {
                            name: guestName,
                            phone: phone
                        }
                    });
                }
                clientId = client.id;
            }

            // 3. Create the Order
            const newOrder = await tx.order.create({
                data: {
                    appointmentId: appointmentId || null,
                    barbershopId,
                    clientId,
                    professionalId,
                    status: 'OPEN'
                }
            });

            // 4. Add initial services if it's a manual order
            if (isManual && serviceIds.length > 0) {
                const services = await tx.service.findMany({
                    where: { id: { in: serviceIds } }
                });

                let subtotal = 0;
                const orderItems = [];

                for (const srv of services) {
                    const price = Number(srv.price);
                    subtotal += price;
                    orderItems.push({
                        orderId: newOrder.id,
                        type: 'SERVICE',
                        serviceId: srv.id,
                        quantity: 1,
                        unitPrice: price,
                        total: price
                    });
                }

                if (orderItems.length > 0) {
                    await tx.orderItem.createMany({ data: orderItems });

                    // Update order totals
                    await tx.order.update({
                        where: { id: newOrder.id },
                        data: {
                            subtotal: subtotal,
                            total: subtotal
                        }
                    });
                }
            }

            return newOrder;
        });

        // 5. Fetch full order with items for response
        const fullOrder = await prisma.order.findUnique({
            where: { id: result.id },
            include: {
                items: { include: { service: true, product: true } },
                client: true,
                professional: true
            }
        });

        res.status(201).json(fullOrder);
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Erro ao criar comanda manual: ' + error.message });
    }
};

// Get Order Details
exports.getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        service: true,
                        product: true
                    }
                },
                client: true,
                professional: true,
                payments: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!order) return res.status(404).json({ message: 'Comanda não encontrada.' });

        // Calculate Balance
        const totalPaid = order.payments
            .filter(p => p.status === 'paid' || p.status === 'APPROVED' || p.status === 'PAID')
            .reduce((acc, p) => acc + Number(p.amount), 0);

        const balance = Math.max(0, order.total - totalPaid);

        res.json({
            ...order,
            totalPaid,
            balance
        });
    } catch (error) {
        console.error('Get Order Error:', error);
        res.status(500).json({ message: 'Erro ao buscar comanda.' });
    }
};

// Add Item to Order
exports.addItem = async (req, res) => {
    try {
        const { id } = req.params; // Order ID
        const { type, serviceId, productId, quantity = 1, unitPrice } = req.body;

        // Validate
        if (!type || (!serviceId && !productId)) {
            return res.status(400).json({ message: 'Dados inválidos.' });
        }

        const total = unitPrice * quantity;

        // Add item and update order totals
        const updatedOrder = await prisma.$transaction(async (tx) => {
            await tx.orderItem.create({
                data: {
                    orderId: id,
                    type, // 'SERVICE' or 'PRODUCT'
                    serviceId: serviceId || null,
                    productId: productId || null,
                    quantity,
                    unitPrice,
                    total
                }
            });

            // Recalculate totals
            const items = await tx.orderItem.findMany({ where: { orderId: id } });
            const newSubtotal = items.reduce((acc, item) => acc + item.total, 0);

            // Fetch current discount from order to maintain it
            const currentOrder = await tx.order.findUnique({ where: { id } });
            const finalTotal = newSubtotal - (currentOrder.discount || 0);

            return await tx.order.update({
                where: { id },
                data: {
                    subtotal: newSubtotal,
                    total: finalTotal
                },
                include: { items: { include: { service: true, product: true } } }
            });
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Add Item Error:', error);
        res.status(500).json({ message: 'Erro ao adicionar item.' });
    }
};

// Remove Item
exports.removeItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
        if (!item) return res.status(404).json({ message: 'Item não encontrado.' });

        const orderId = item.orderId;

        const updatedOrder = await prisma.$transaction(async (tx) => {
            await tx.orderItem.delete({ where: { id: itemId } });

            // Recalculate totals
            const items = await tx.orderItem.findMany({ where: { orderId } });
            const newSubtotal = items.reduce((acc, curr) => acc + curr.total, 0);

            const currentOrder = await tx.order.findUnique({ where: { id: orderId } });
            const finalTotal = newSubtotal - (currentOrder.discount || 0);

            return await tx.order.update({
                where: { id: orderId },
                data: {
                    subtotal: newSubtotal,
                    total: finalTotal
                },
                include: { items: { include: { service: true, product: true } } }
            });
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Remove Item Error:', error);
        res.status(500).json({ message: 'Erro ao remover item.' });
    }
};

// Update Discount
exports.updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const { discount } = req.body;

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) return res.status(404).json({ message: 'Comanda não encontrada.' });

        const finalDiscount = parseFloat(discount) || 0;
        const finalTotal = order.subtotal - finalDiscount;

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                discount: finalDiscount,
                total: finalTotal
            },
            include: {
                items: {
                    include: {
                        service: true,
                        product: true
                    }
                },
                client: true,
                professional: true
            }
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Update Discount Error:', error);
        res.status(500).json({ message: 'Erro ao atualizar desconto.' });
    }
};

const couponController = require('./coupon.controller');

// Apply Coupon (POST /orders/:id/coupon { code })
exports.applyCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const code = String(req.body.code || '').trim().toUpperCase();
        if (!code) return res.status(400).json({ message: 'Informe o código do cupom.' });

        const userShopId = req.user.barbershopId || req.user.workedBarbershopId;
        if (req.user.role === 'CLIENT' || (!userShopId && req.user.role !== 'SUPER_ADMIN')) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const fail = (status, message) => Object.assign(new Error(message), { httpStatus: status });

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id } });
            if (!order || (req.user.role !== 'SUPER_ADMIN' && order.barbershopId !== userShopId)) {
                throw fail(404, 'Comanda não encontrada.');
            }
            if (order.status !== 'OPEN') throw fail(400, 'Só é possível aplicar cupom em comanda aberta.');
            if (/(^|\n)Cupom: /.test(order.notes || '')) throw fail(400, 'Esta comanda já tem um cupom aplicado.');

            const coupon = await tx.coupon.findFirst({ where: { barbershopId: order.barbershopId, code } });
            const check = await couponController.checkCoupon(tx, coupon, {
                amount: order.subtotal, clientId: order.clientId, barbershopId: order.barbershopId
            });
            if (!check.ok) throw fail(check.status, check.message);

            const used = await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
            if (coupon.maxUses != null && used.usedCount > coupon.maxUses) throw fail(400, 'Cupom esgotado.');

            return await tx.order.update({
                where: { id },
                data: {
                    discount: check.discount,
                    total: order.subtotal - check.discount,
                    notes: order.notes ? `${order.notes}\nCupom: ${coupon.code}` : `Cupom: ${coupon.code}`
                },
                include: {
                    items: { include: { service: true, product: true } },
                    client: true,
                    professional: true
                }
            });
        });

        res.json(updatedOrder);
    } catch (error) {
        if (error.httpStatus) return res.status(error.httpStatus).json({ message: error.message });
        console.error('Apply Coupon Error:', error);
        res.status(500).json({ message: 'Erro ao aplicar cupom.' });
    }
};

const TransactionService = require('../services/TransactionService');

// Close/Pay Order
exports.closeOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod, discount, emitNfe } = req.body;
        // Fiado: fecha a comanda lançando o valor na conta do cliente (sem receita agora)
        const onAccount = req.body.onAccount === true || paymentMethod === 'FIADO';

        if (!paymentMethod && !onAccount) {
            return res.status(400).json({ message: 'Selecione a forma de pagamento.' });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { service: true } },
                professional: true,
                client: true
            }
        });
        if (!order) return res.status(404).json({ message: 'Comanda não encontrada.' });
        if (order.status === 'PAID' || order.status === 'CLOSED') {
            return res.status(400).json({ message: 'Esta comanda já foi finalizada.' });
        }

        // Removed blocking check for Open Shift (24/7 Operation)

        const finalDiscount = discount !== undefined ? parseFloat(discount) : order.discount;
        const finalTotal = order.subtotal - finalDiscount;
        if (onAccount && !(finalTotal > 0)) {
            return res.status(400).json({ message: 'Comanda sem valor para lançar no fiado.' });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Check if already paid (Prepaid via Online)
            let isPrepaid = false;
            if (order.paymentStatus === 'PAID') isPrepaid = true;
            if (!isPrepaid && order.appointmentId) {
                const apt = await tx.appointment.findUnique({ where: { id: order.appointmentId } });
                if (apt && apt.paymentStatus === 'PAID') isPrepaid = true;
            }

            if (isPrepaid) {
                // Just Close, no new financial transaction
                const updatedOrder = await tx.order.update({
                    where: { id },
                    data: {
                        status: 'CLOSED',
                        paymentStatus: 'PAID',
                        paymentMethod: onAccount ? undefined : paymentMethod,
                        discount: finalDiscount,
                        total: finalTotal,
                        paidAt: new Date()
                    }
                });
                return { order: updatedOrder, message: 'Comanda finalizada (Pré-paga).' };
            }

            if (onAccount) {
                // Fiado: sem INCOME agora; a receita entra quando o cliente paga a conta
                // (lançamento PAYMENT em account.controller cria a transação "Fiado").
                const updatedOrder = await tx.order.update({
                    where: { id },
                    data: {
                        status: 'CLOSED',
                        paymentStatus: 'PENDING',
                        paymentMethod: null,
                        discount: finalDiscount,
                        total: finalTotal
                    }
                });
                const accountEntry = await tx.clientAccountEntry.create({
                    data: {
                        barbershopId: order.barbershopId,
                        clientId: order.clientId,
                        clientName: order.client?.name || 'Cliente',
                        type: 'CHARGE',
                        amount: finalTotal,
                        description: `Comanda #${order.id}`
                    }
                });
                // Comissão igual ao fechamento normal (mesma base/taxa do TransactionService),
                // só que sem transactionId: o serviço foi prestado mesmo sem o dinheiro ter entrado.
                if (order.professionalId) {
                    const gross = order.items.reduce((sum, i) => sum + i.total, 0);
                    const base = gross > 0 ? gross : finalTotal;
                    const proUser = await tx.user.findUnique({
                        where: { id: order.professionalId },
                        include: { professionalProfile: true }
                    });
                    const rate = proUser?.professionalProfile?.commissionPercent ?? 50;
                    await tx.commission.create({
                        data: {
                            barberId: order.professionalId,
                            barbershopId: order.barbershopId,
                            appointmentId: order.appointmentId || null,
                            type: 'SERVICE',
                            description: `Comissão - Fiado Comanda #${order.id.substring(0, 8)}`,
                            amount: (base * rate) / 100,
                            percentage: rate,
                            status: 'PENDING'
                        }
                    });
                }
                if (order.appointmentId) {
                    await tx.appointment.update({ where: { id: order.appointmentId }, data: { status: 'COMPLETED' } });
                }
                return { order: updatedOrder, accountEntry, message: 'Comanda lançada no fiado.' };
            }

            // Standard Payment Flow
            const transaction = await TransactionService.createTransaction({
                barbershopId: order.barbershopId,
                amount: finalTotal,
                method: paymentMethod,
                origin: 'PRESENCIAL', // Manual closing
                orderId: id,
                appointmentId: order.appointmentId,
                professionalId: order.professionalId,
                description: `Venda Presencial - Comanda #${order.id.substring(0, 8)} ${order.client ? '- ' + order.client.name : ''}`
            }, tx);

            // Assuming TransactionService returns the transaction object.
            const updatedOrder = await tx.order.findUnique({ where: { id } });

            return { order: updatedOrder, transaction };
        });



        res.json(result);
    } catch (error) {
        console.error('Close Order Error:', error);
        res.status(500).json({ message: 'Erro ao fechar comanda: ' + error.message });
    }
};

// List Orders
exports.listOrders = async (req, res) => {
    try {
        const { barbershopId, page = 1, limit = 25 } = req.query;

        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const p = parseInt(page);
        const l = parseInt(limit);
        const skip = (p - 1) * l;

        const where = { barbershopId };

        const [total, orders] = await Promise.all([
            prisma.order.count({ where }),
            prisma.order.findMany({
                where,
                include: {
                    client: {
                        select: { id: true, name: true, phone: true }
                    },
                    professional: {
                        select: { id: true, name: true }
                    },
                    items: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: l
            })
        ]);

        res.json({
            data: orders,
            total,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
        });
    } catch (error) {
        console.error('List Orders Error:', error);
        res.status(500).json({ message: 'Erro ao listar comandas.' });
    }
};
