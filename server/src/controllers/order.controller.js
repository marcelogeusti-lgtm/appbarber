const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create new Order (linked to Appointment)
exports.createOrder = async (req, res) => {
    try {
        const { appointmentId, barbershopId, clientId, professionalId } = req.body;

        // Check if order already exists for this appointment
        const existing = await prisma.order.findUnique({
            where: { appointmentId }
        });

        if (existing) {
            return res.status(200).json(existing);
        }

        const newOrder = await prisma.order.create({
            data: {
                appointmentId,
                barbershopId,
                clientId,
                professionalId,
                status: 'OPEN'
            }
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Erro ao criar comanda.' });
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
                professional: true
            }
        });

        if (!order) return res.status(404).json({ message: 'Comanda não encontrada.' });

        res.json(order);
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

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) return res.status(404).json({ message: 'Comanda não encontrada.' });

        const finalDiscount = discount !== undefined ? discount : order.discount;
        const finalTotal = order.subtotal - finalDiscount;

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: 'PAID',
                paymentStatus: 'PAID',
                paymentMethod,
                discount: finalDiscount,
                total: finalTotal,
                paidAt: new Date(),
                status: 'CLOSED'
            }
        });

        // Optionally: Update Appointment payment status as well
        if (order.appointmentId) {
            await prisma.appointment.update({
                where: { id: order.appointmentId },
                data: {
                    paymentStatus: 'PAID',
                    paymentMethod,
                    status: 'COMPLETED' // Assume completed if paid
                }
            });
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error('Close Order Error:', error);
        res.status(500).json({ message: 'Erro ao fechar comanda.' });
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
