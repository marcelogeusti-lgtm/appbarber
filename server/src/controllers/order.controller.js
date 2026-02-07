const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

// Close/Pay Order
exports.closeOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod, discount } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ message: 'Selecione a forma de pagamento.' });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: true }
        });
        if (!order) return res.status(404).json({ message: 'Comanda não encontrada.' });
        if (order.status === 'PAID' || order.status === 'CLOSED') {
            return res.status(400).json({ message: 'Esta comanda já foi finalizada.' });
        }

        // 1. Verify open shift
        const openShift = await prisma.cashShift.findFirst({
            where: { barbershopId: order.barbershopId, status: 'OPEN' }
        });

        if (!openShift) {
            return res.status(400).json({
                message: 'Não há caixa aberto. Abra o caixa antes de finalizar a comanda.'
            });
        }

        const finalDiscount = discount !== undefined ? parseFloat(discount) : order.discount;
        const finalTotal = order.subtotal - finalDiscount;

        const result = await prisma.$transaction(async (tx) => {
            // 2. Update Order
            const updatedOrder = await tx.order.update({
                where: { id },
                data: {
                    status: 'CLOSED',
                    paymentStatus: 'PAID',
                    paymentMethod,
                    discount: finalDiscount,
                    total: finalTotal,
                    paidAt: new Date(),
                }
            });

            // 3. Create Transaction (Caixa Entry)
            await tx.transaction.create({
                data: {
                    description: `Venda - Comanda ${order.id.substring(0, 8)}`,
                    amount: finalTotal,
                    type: 'INCOME',
                    category: 'Comanda',
                    date: new Date(),
                    barbershopId: order.barbershopId,
                    orderId: id,
                    cashShiftId: openShift.id
                }
            });

            // 4. Update Shift Balance
            await tx.cashShift.update({
                where: { id: openShift.id },
                data: {
                    currentBalance: { increment: finalTotal }
                }
            });

            // 5. Update Appointment status if exists
            if (order.appointmentId) {
                await tx.appointment.update({
                    where: { id: order.appointmentId },
                    data: {
                        paymentStatus: 'PAID',
                        paymentMethod,
                        status: 'COMPLETED'
                    }
                });
            }

            return updatedOrder;
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
        const { barbershopId } = req.query;

        const orders = await prisma.order.findMany({
            where: {
                barbershopId: barbershopId
            },
            include: {
                client: true,
                professional: true,
                items: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('List Orders Error:', error);
        res.status(500).json({ message: 'Erro ao listar comandas.' });
    }
};
