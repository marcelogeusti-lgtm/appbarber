const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { differenceInDays } = require('date-fns');

// Helper to recalculate status
const syncClientStatus = async (barbershopId, clientId) => {
    try {
        // 1. Fetch History
        const appointments = await prisma.appointment.findMany({
            where: {
                barbershopId,
                clientId,
                status: { in: ['COMPLETED', 'CONFIRMED', 'NO_SHOW'] }
            },
            orderBy: { date: 'desc' }
        });

        const totalVisits = appointments.filter(a => a.status === 'COMPLETED').length;
        const lastAppt = appointments[0]; // Most recent
        const lastVisitDate = lastAppt ? lastAppt.date : null;

        // Calculate Total Spent (from Orders)
        const orders = await prisma.order.findMany({
            where: {
                barbershopId,
                clientId,
                status: { in: ['PAID', 'CLOSED'] }
            }
        });
        const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);

        // Determine Status
        let newStatus = 'NEW';

        // Check Active Package (High Priority)
        const activeSub = await prisma.userSubscription.findFirst({
            where: {
                userId: clientId,
                plan: { barbershopId }, // Linked to this shop
                status: 'ACTIVE',
                endDate: { gte: new Date() }
            }
        });

        if (activeSub) {
            newStatus = 'ACTIVE_PACKAGE';
        } else {
            // Logic Hierarchy
            if (lastAppt && lastAppt.status === 'NO_SHOW') {
                newStatus = 'ABSENT';
            } else if (totalVisits >= 2) {
                // Check Inactivity
                if (lastVisitDate) {
                    const daysSince = differenceInDays(new Date(), new Date(lastVisitDate));
                    if (daysSince > 45) { // Configurable threshold ideally
                        newStatus = 'INACTIVE';
                    } else {
                        newStatus = 'RECURRING';
                    }
                } else {
                    newStatus = 'RECURRING'; // Should have date if visited, but fallback
                }
            } else if (totalVisits === 1) {
                // Check Inactivity for New
                if (lastVisitDate) {
                    const daysSince = differenceInDays(new Date(), new Date(lastVisitDate));
                    if (daysSince > 30) newStatus = 'INACTIVE';
                    else newStatus = 'NEW';
                }
            } else {
                newStatus = 'NEW'; // 0 visits or pending
            }
        }

        // Upsert BarbershopClient
        await prisma.barbershopClient.upsert({
            where: {
                barbershopId_clientId: {
                    barbershopId,
                    clientId
                }
            },
            update: {
                totalVisits,
                totalSpent,
                lastVisit: lastVisitDate,
                status: newStatus
            },
            create: {
                barbershopId,
                clientId,
                totalVisits,
                totalSpent,
                lastVisit: lastVisitDate,
                status: newStatus
            }
        });

        return newStatus;

    } catch (e) {
        console.error('Error syncing client status:', e);
    }
};

exports.syncClientStatus = syncClientStatus;

// --- API Methods ---

exports.getClients = async (req, res) => {
    try {
        const { id: barbershopId } = req.params; // or query? Barbershop context needed.
        // Usually Admin accesses /api/barbershops/:id/clients
        // Or if logged in as Barber, use work context.

        // Let's assume passed via Query or derived from user
        const targetBarbershopId = req.query.barbershopId || req.user.workedBarbershopId || req.user.ownedBarbershops?.[0]?.id; // Simplification

        if (!targetBarbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const { status, search } = req.query;

        const where = { barbershopId: targetBarbershopId };

        if (status && status !== 'ALL') {
            // Map frontend filters to Enum
            // 'Novos' -> NEW
            // 'Recorrentes' -> RECURRING
            // 'Pacote' -> ACTIVE_PACKAGE
            // 'Inativos' -> INACTIVE
            // 'Faltantes' -> ABSENT
            const map = {
                'Novos': 'NEW',
                'Recorrentes': 'RECURRING',
                'Pacote': 'ACTIVE_PACKAGE',
                'Inativos': 'INACTIVE',
                'Faltantes': 'ABSENT'
            };
            if (map[status]) where.status = map[status];
        }

        if (search) {
            where.client = {
                name: { contains: search, mode: 'insensitive' }
            };
        }

        const clients = await prisma.barbershopClient.findMany({
            where,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        avatarUrl: true,
                        birthday: true
                    }
                }
            },
            orderBy: { lastVisit: 'desc' } // Most recent first
        });

        res.json(clients);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching clients' });
    }
};

exports.updateClientNotes = async (req, res) => {
    try {
        const { clientId, barbershopId, notes } = req.body;

        await prisma.barbershopClient.update({
            where: {
                barbershopId_clientId: { barbershopId, clientId }
            },
            data: { internalNotes: notes }
        });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ message: 'Error updating notes' });
    }
};
