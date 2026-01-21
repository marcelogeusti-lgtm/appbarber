const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// List Clients of a Barbershop
// List Clients of a Barbershop
// Strategy: Find users who have at least one Appointment, Order, or Manual Entry with this barbershop
exports.listClients = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const clientIds = new Set();

        // 1. Get from Communication Logs (Primary source)
        const logClients = await prisma.communicationLog.findMany({
            where: { barbershopId },
            select: { clientId: true },
            distinct: ['clientId']
        });
        logClients.forEach(c => clientIds.add(c.clientId));

        // 2. Get from Appointments (Historical)
        const appointmentClients = await prisma.appointment.findMany({
            where: { barbershopId },
            select: { clientId: true },
            distinct: ['clientId']
        });
        appointmentClients.forEach(c => clientIds.add(c.clientId));

        // 3. Get from Orders (Historical)
        const orderClients = await prisma.order.findMany({
            where: { barbershopId },
            select: { clientId: true },
            distinct: ['clientId']
        });
        orderClients.forEach(c => clientIds.add(c.clientId));

        const validIds = Array.from(clientIds).filter(id => id);

        if (validIds.length === 0) {
            return res.json([]);
        }

        const clients = await prisma.user.findMany({
            where: {
                id: { in: validIds }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                avatarUrl: true,
                createdAt: true // Include createdAt for display
            }
        });

        // Enhance with Stats
        // Optimized: Fetch all stats in bulk if possible?
        // OR just keep per-client but safe for now. optimizing N+1 requires grouping.
        // Given complexity limits, let's stick to per-client but ensure it's robust.

        const enhancedClients = await Promise.all(clients.map(async (client) => {
            const lastAppointment = await prisma.appointment.findFirst({
                where: { clientId: client.id, barbershopId },
                orderBy: { date: 'desc' },
                select: { date: true }
            });

            const stats = await prisma.order.aggregate({
                where: { clientId: client.id, barbershopId, status: { in: ['PAID', 'CLOSED'] } },
                _sum: { total: true },
                _count: { id: true }
            });

            // Calculate total visits from COMPLETED appointments as well?
            // "Total visits" usually implies completed appointments.
            const visitCount = await prisma.appointment.count({
                where: { clientId: client.id, barbershopId, status: 'COMPLETED' }
            });

            return {
                ...client,
                lastVisit: lastAppointment?.date || null,
                totalSpent: Number(stats._sum.total || 0),
                totalVisits: visitCount || Number(stats._count.id || 0) // Prefer appointment count for visits
            };
        }));

        // Sort by Last Visit (Recent first)
        enhancedClients.sort((a, b) => {
            if (!a.lastVisit) return 1;
            if (!b.lastVisit) return -1;
            return new Date(b.lastVisit) - new Date(a.lastVisit);
        });

        res.json(enhancedClients);
    } catch (error) {
        console.error('List Clients Error:', error);
        res.status(500).json({ message: 'Server error fetching clients' });
    }
};

exports.createClient = async (req, res) => {
    try {
        const { name, phone, email, notes, barbershopId, avatarUrl } = req.body;

        if (!name || !phone || !barbershopId) {
            return res.status(400).json({ message: 'Nome, Telefone e Barbearia são obrigatórios' });
        }

        // Check if user exists
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone },
                    ...(email ? [{ email }] : [])
                ]
            }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name,
                    phone,
                    email: email || null,
                    role: 'CLIENT',
                    avatarUrl: avatarUrl || null
                }
            });
        } else {
            // Optional: Update name if provided and inconsistent? 
            // Better keep existing unless explicit update requested.
            // Just link.
        }

        // Ensure Link (Create Log) to make them appear in the list
        await prisma.communicationLog.create({
            data: {
                barbershopId,
                clientId: user.id,
                channel: 'PORTAL',
                direction: 'INBOUND',
                type: 'MANUAL',
                content: `Cliente cadastrado manualmente. Obs: ${notes || '-'}`,
                status: 'READ'
            }
        });

        res.status(201).json(user);
    } catch (error) {
        console.error('Create Client Error:', error);
        res.status(500).json({ message: 'Erro ao cadastrar cliente' });
    }
};

// Get Single Client Details with History
exports.getClientDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { barbershopId } = req.query;

        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const client = await prisma.user.findUnique({
            where: { id }
        });

        if (!client) return res.status(404).json({ message: 'Client not found' });

        // History: Appointments
        const appointments = await prisma.appointment.findMany({
            where: { clientId: id, barbershopId },
            include: {
                service: true,
                professional: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });

        // History: Orders/Products
        const orders = await prisma.order.findMany({
            where: { clientId: id, barbershopId },
            include: {
                items: { include: { service: true, product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Loyalty/Subscriptions (If exists)
        const subscriptions = await prisma.userSubscription.findMany({
            where: { userId: id, subscriptionPlan: { barbershopId } },
            include: { subscriptionPlan: true }
        });

        // Calculate Stats
        const totalSpent = orders.reduce((sum, o) => {
            return (o.status === 'PAID' || o.status === 'CLOSED') ? sum + (o.total || 0) : sum;
        }, 0);

        const noShows = await prisma.noShowRecord.count({
            where: { clientId: id, barbershopId }
        });

        res.json({
            client,
            appointments,
            orders,
            subscriptions,
            stats: {
                totalSpent,
                totalVisits: appointments.filter(a => a.status === 'COMPLETED').length, // Or use orders count
                noShows
            }
        });

    } catch (error) {
        console.error('Client Details Error:', error);
        res.status(500).json({ message: 'Error fetching client details' });
    }
};

// Update Client Profile (Self)
exports.updateClientProfile = async (req, res) => {
    try {
        const clientId = req.user.id; // From Client Token
        const { name, phone, birthDate, gender, avatarUrl } = req.body;

        // Validations
        if (!clientId) return res.status(401).json({ message: 'Unauthorized' });

        // Parse birthDate if string
        let formattedBirthDate = null;
        if (birthDate) {
            formattedBirthDate = new Date(birthDate);
            if (isNaN(formattedBirthDate.getTime())) {
                formattedBirthDate = null; // or throw error
            }
        }

        const updatedClient = await prisma.client.update({
            where: { id: clientId },
            data: {
                name,
                phone,
                gender: gender || null,
                birthDate: formattedBirthDate,
                avatarUrl // Optional update
            }
        });

        // Note: Email update is handled via AuthUser and usually requires re-verification.
        // We do NOT update email here to avoid security issues.

        res.json({
            message: 'Perfil atualizado com sucesso',
            user: {
                id: updatedClient.id,
                name: updatedClient.name,
                // email: req.user.email, // Keep existing email from token/auth
                phone: updatedClient.phone,
                avatarUrl: updatedClient.avatarUrl,
                birthDate: updatedClient.birthDate,
                gender: updatedClient.gender,
                role: 'CLIENT'
            }
        });

    } catch (error) {
        console.error('Update Client Error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Este telefone já está em uso.' });
        }
        res.status(500).json({ message: 'Erro ao atualizar perfil.' });
    }
};
