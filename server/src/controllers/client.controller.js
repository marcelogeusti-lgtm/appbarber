const prisma = require('../lib/prisma');

// List Clients of a Barbershop
// List Clients of a Barbershop
// Strategy: Find users who have at least one Appointment, Order, or Manual Entry with this barbershop
exports.listClients = async (req, res) => {
    try {
        const { barbershopId, page = 1, limit = 25 } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const p = parseInt(page);
        const l = parseInt(limit);
        const skip = (p - 1) * l;

        const clientIds = new Set();

        // 1. Get from Communication Logs (Primary source for manual/portal links)
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
            return res.json({ data: [], total: 0, page: p, limit: l, totalPages: 0 });
        }

        // Fetch total count for pagination
        const total = await prisma.client.count({
            where: {
                id: { in: validIds },
                active: true
            }
        });

        // Fetch from Client table
        const clients = await prisma.client.findMany({
            where: {
                id: { in: validIds },
                active: true
            },
            select: {
                id: true,
                name: true,
                phone: true,
                avatarUrl: true,
                createdAt: true,
                authUser: {
                    select: {
                        email: true
                    }
                }
            },
            skip,
            take: l
        });

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

            const visitCount = await prisma.appointment.count({
                where: { clientId: client.id, barbershopId, status: 'COMPLETED' }
            });

            return {
                id: client.id,
                name: client.name,
                phone: client.phone,
                email: client.authUser?.email || null,
                avatarUrl: client.avatarUrl,
                createdAt: client.createdAt,
                lastVisit: lastAppointment?.date || null,
                totalSpent: Number(stats._sum.total || 0),
                totalVisits: visitCount || Number(stats._count.id || 0)
            };
        }));

        // Note: The sort is applied after fetching, but since skip/take is applied to the ID fetch above, 
        // the overall sorting of the entire set based on 'lastVisit' would require a different DB approach.
        // For now, we apply skip/take to the Client table join.
        enhancedClients.sort((a, b) => {
            if (!a.lastVisit) return 1;
            if (!b.lastVisit) return -1;
            return new Date(b.lastVisit) - new Date(a.lastVisit);
        });

        res.json({
            data: enhancedClients,
            total,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
        });
    } catch (error) {
        console.error('List Clients Error:', error);
        res.status(500).json({ message: 'Server error fetching clients' });
    }
};

exports.searchClients = async (req, res) => {
    try {
        const { barbershopId, search } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        if (!search || search.length < 3) return res.json({ data: [] });

        // Optimization: Find clients linked to this barbershop
        // We look in Appointments, Orders, and CommunicationLogs as they are the links
        const [appointmentClients, orderClients, logClients] = await Promise.all([
            prisma.appointment.findMany({
                where: { barbershopId },
                select: { clientId: true },
                distinct: ['clientId']
            }),
            prisma.order.findMany({
                where: { barbershopId },
                select: { clientId: true },
                distinct: ['clientId']
            }),
            prisma.communicationLog.findMany({
                where: { barbershopId },
                select: { clientId: true },
                distinct: ['clientId']
            })
        ]);

        const linkedClientIds = [
            ...new Set([
                ...appointmentClients.map(c => c.clientId),
                ...orderClients.map(c => c.clientId),
                ...logClients.map(c => c.clientId)
            ])
        ];

        if (linkedClientIds.length === 0) {
            return res.json({ data: [] });
        }

        const clients = await prisma.client.findMany({
            where: {
                id: { in: linkedClientIds },
                active: true,
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { cpf: { contains: search } },
                    { cnpj: { contains: search } }
                ]
            },
            select: {
                id: true,
                name: true,
                phone: true,
                cpf: true,
                cnpj: true,
                authUser: { select: { email: true } }
            },
            take: 10
        });

        res.json({ data: clients });
    } catch (error) {
        console.error('Search Clients Error:', error);
        res.status(500).json({ message: 'Error searching clients' });
    }
};

exports.createClient = async (req, res) => {
    try {
        const { name, phone, email, notes, barbershopId, avatarUrl } = req.body;

        if (!name || !phone || !barbershopId) {
            return res.status(400).json({ message: 'Nome, Telefone e Barbearia são obrigatórios' });
        }

        // Check if Client already exists by phone
        let client = await prisma.client.findFirst({
            where: { phone }
        });

        if (!client) {
            // Create in Client table
            client = await prisma.client.create({
                data: {
                    name,
                    phone,
                    avatarUrl: avatarUrl || null,
                    theme: 'dark'
                }
            });
        } else if (!client.active) {
            // Re-activate if they were soft-deleted
            client = await prisma.client.update({
                where: { id: client.id },
                data: { active: true }
            });
        }

        // Ensure Link (Create Log) to make them appear in the list for this barbershop
        await prisma.communicationLog.create({
            data: {
                barbershopId,
                clientId: client.id,
                channel: 'PORTAL',
                direction: 'INBOUND',
                type: 'MANUAL',
                content: `Cliente cadastrado manualmente. Obs: ${notes || '-'}`,
                status: 'READ'
            }
        });

        res.status(201).json(client);
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

        const client = await prisma.client.findUnique({
            where: { id },
            include: { authUser: { select: { email: true } } }
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

        // Loyalty/Subscriptions (Corrected model: ClientSubscription)
        const subscriptions = await prisma.clientSubscription.findMany({
            where: { clientId: id, plan: { barbershopId } },
            include: { plan: true }
        });

        // Calculate Stats
        const totalSpent = orders.reduce((sum, o) => {
            return (o.status === 'PAID' || o.status === 'CLOSED') ? sum + (o.total || 0) : sum;
        }, 0);

        const noShows = await prisma.noShowRecord.count({
            where: { clientId: id, barbershopId }
        });

        // NFE History
        const nfes = await prisma.nfe.findMany({
            where: { clientId: id, barbershopId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            client: {
                ...client,
                email: client.authUser?.email || null
            },
            appointments,
            orders,
            subscriptions: subscriptions.map(s => ({ ...s, subscriptionPlan: s.plan })), // Compatibility with frontend
            nfes,
            stats: {
                totalSpent,
                totalVisits: appointments.filter(a => a.status === 'COMPLETED').length,
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
        let { name, phone, birthDate, gender, avatarUrl, cpf, cnpj, requiresNfe } = req.body;

        // Validations
        if (!clientId) return res.status(401).json({ message: 'Unauthorized' });

        // sanitize phone: remove non-numeric
        if (phone) {
            phone = phone.replace(/\D/g, '');
        }

        // Parse birthDate if string
        let formattedBirthDate = null;
        if (birthDate) {
            // Append T12:00:00Z to avoid timezone day shift when converting from YYYY-MM-DD
            const normalizeDate = birthDate.includes('T') ? birthDate : `${birthDate}T12:00:00Z`;
            formattedBirthDate = new Date(normalizeDate);
            if (isNaN(formattedBirthDate.getTime())) {
                formattedBirthDate = null;
            }
        }

        const updatedClient = await prisma.client.update({
            where: { id: clientId },
            data: {
                name,
                phone,
                gender: gender || null,
                birthDate: formattedBirthDate,
                avatarUrl, // Optional update
                // Fiscal fields (cpf, cnpj, requiresNfe) are ignored here as clients should not request invoices via system
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

// Delete Client (Soft Delete: Mark as inactive)
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { barbershopId } = req.query;
        const requestingUser = req.user; // From protect middleware

        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        // 1. Authorization: Only ADMIN or SUPER_ADMIN (or the barber of the shop) 
        // Note: authorize middleware already handles role check, but we verify here for safety.
        if (!['ADMIN', 'SUPER_ADMIN', 'BARBER'].includes(requestingUser.role)) {
            return res.status(403).json({ message: 'Sem permissão para excluir clientes.' });
        }

        // 2. Protection: Don't allow soft-deleting a client if they have an associated administrative User record
        const client = await prisma.client.findUnique({
            where: { id },
            include: { authUser: { include: { user: true } } }
        });

        if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });

        // If the client record is linked to a Professional/Admin User, we MUST NOT "deactivate" it 
        // if that deactivation affects their login or other modules. 
        // Actually, setting active: false on 'Client' only hides them from the client list.
        // But the user said: "mesmo que esse cliente for o dono da barbearia a conta dele como dono do saas não deve ser exluida"

        if (client.authUser?.user && ['ADMIN', 'SUPER_ADMIN'].includes(client.authUser.user.role)) {
            // If it's the owner, we just say we can't delete the owner from their own management list as a "client" 
            // to avoid confusion, or we just allow it but ENSURE we don't touch the User table.
            // Given the user's worry, let's BLOCK deletion of administrative users from the client list 
            // and explain they are system admins.
            return res.status(400).json({
                message: 'Não é possível excluir um Administrador ou Master da lista de clientes.'
            });
        }

        // 3. Perform Soft Delete
        await prisma.client.update({
            where: { id },
            data: { active: false }
        });

        res.json({ message: 'Cliente removido da sua lista com sucesso' });
    } catch (error) {
        console.error('Delete Client Error:', error);
        res.status(500).json({ message: 'Erro ao remover cliente' });
    }
};

exports.toggleFavorite = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { barbershopId } = req.body;

        if (!clientId) return res.status(401).json({ message: 'Unauthorized' });
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const existing = await prisma.favoriteBarbershop.findUnique({
            where: {
                clientId_barbershopId: { clientId, barbershopId }
            }
        });

        if (existing) {
            await prisma.favoriteBarbershop.delete({
                where: { id: existing.id }
            });
            return res.json({ message: 'Removido dos favoritos', isFavorite: false });
        } else {
            await prisma.favoriteBarbershop.create({
                data: { clientId, barbershopId }
            });
            return res.json({ message: 'Adicionado aos favoritos', isFavorite: true });
        }
    } catch (error) {
        console.error('Toggle Favorite Error:', error);
        res.status(500).json({ message: 'Error toggling favorite' });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const clientId = req.user.id;
        if (!clientId) return res.status(401).json({ message: 'Unauthorized' });

        const favorites = await prisma.favoriteBarbershop.findMany({
            where: { clientId }
        });

        res.json(favorites);
    } catch (error) {
        console.error('Get Favorites Error:', error);
        res.status(500).json({ message: 'Error fetching favorites' });
    }
};

