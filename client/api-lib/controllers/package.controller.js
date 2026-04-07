const prisma = require('../lib/prisma');
const { addDays } = require('date-fns');

// --- Admin / Barbershop Actions ---

exports.createPackage = async (req, res) => {
    try {
        const { name, description, price, validityDays, totalQuantity, serviceIds, barbershopId } = req.body;

        // serviceIds is array of strings
        const connectServices = serviceIds ? serviceIds.map(id => ({ id })) : [];

        const pkg = await prisma.barbershopPackage.create({
            data: {
                name,
                description,
                price,
                validityDays: Number(validityDays),
                totalQuantity: Number(totalQuantity),
                barbershopId,
                services: {
                    connect: connectServices
                }
            }
        });

        res.json(pkg);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating package' });
    }
};

exports.getPackages = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        const packages = await prisma.barbershopPackage.findMany({
            where: { barbershopId, active: true },
            include: { services: { select: { id: true, name: true } } }
        });
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages' });
    }
};

// --- Client / Usage Actions ---

exports.assignPackageToClient = async (req, res) => {
    try {
        const { clientId, packageId } = req.body;

        const pkg = await prisma.barbershopPackage.findUnique({ where: { id: packageId } });
        if (!pkg) return res.status(404).json({ message: 'Package not found' });

        const startDate = new Date();
        const endDate = addDays(startDate, pkg.validityDays);

        const clientPackage = await prisma.clientPackage.create({
            data: {
                clientId,
                packageId,
                totalQuantity: pkg.totalQuantity,
                remainingQuantity: pkg.totalQuantity, // Starts full
                startDate,
                endDate,
                status: 'ACTIVE'
            }
        });

        // CRM Sync Removed


        res.json(clientPackage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error assigning package' });
    }
};

exports.getClientPackages = async (req, res) => {
    try {
        const { clientId } = req.params;
        // Optional filter by status?
        const packages = await prisma.clientPackage.findMany({
            where: { clientId },
            include: {
                package: {
                    include: { services: { select: { id: true, name: true } } }
                }
            },
            orderBy: { endDate: 'desc' }
        });
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching client packages' });
    }
};

// Helper for Appointment Controller
exports.checkAndUsePackage = async (clientId, serviceId, barbershopId) => {
    // 1. Find ACTIVE package that covers this service
    // Must handle many-to-many: Package -> Services
    // We need a ClientPackage where status=ACTIVE, remaining > 0, endDate > now
    // AND package.services includes serviceId

    // Prisma query is tricky for "includes in relation". 

    const validPackages = await prisma.clientPackage.findMany({
        where: {
            clientId,
            status: 'ACTIVE',
            remainingQuantity: { gt: 0 },
            endDate: { gte: new Date() },
            package: {
                barbershopId,
                services: {
                    some: { id: serviceId }
                }
            }
        },
        orderBy: { endDate: 'asc' }, // Use closest to expiry first
        include: { package: true }
    });

    if (validPackages.length === 0) return null;

    const selectedPkg = validPackages[0];

    // Decrement
    const updated = await prisma.clientPackage.update({
        where: { id: selectedPkg.id },
        data: {
            remainingQuantity: { increment: -1 }
        }
    });

    // Check if finished
    if (updated.remainingQuantity <= 0) {
        await prisma.clientPackage.update({
            where: { id: selectedPkg.id },
            data: { status: 'USED' } // Finished
        });
    }

    return selectedPkg;
};

exports.purchasePackage = async (req, res) => {
    try {
        const { planId, paymentMethod } = req.body;
        const clientId = req.user.id;

        // Note: Frontend sends 'planId', which maps to Package ID
        const pkg = await prisma.barbershopPackage.findUnique({ where: { id: planId } });
        if (!pkg) return res.status(404).json({ message: 'Pacote não encontrado' });

        const startDate = new Date();
        const endDate = addDays(startDate, pkg.validityDays);

        // Transaction: Create ClientPackage & Financial Record
        const result = await prisma.$transaction(async (tx) => {
            const clientPackage = await tx.clientPackage.create({
                data: {
                    clientId,
                    packageId: planId,
                    totalQuantity: pkg.totalQuantity,
                    remainingQuantity: pkg.totalQuantity,
                    startDate,
                    endDate,
                    status: 'ACTIVE'
                }
            });

            // Record Income Transaction
            await tx.transaction.create({
                data: {
                    description: `Venda de Pacote: ${pkg.name}`,
                    amount: pkg.price,
                    type: 'INCOME',
                    category: 'PACKAGE',
                    barbershopId: pkg.barbershopId,
                    date: new Date()
                }
            });

            return clientPackage;
        });

        // CRM Sync Removed (Decoupled)


        res.json(result);
    } catch (error) {
        console.error('Purchase Package Error:', error);
        res.status(500).json({ message: 'Erro ao processar compra do pacote' });
    }
};
