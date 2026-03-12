const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixFakeData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const masterShop = await prisma.barbershop.findUnique({
        where: { slug: 'next' },
        include: { staff: true }
    });

    if (!masterShop) {
        console.error("Master shop not found");
        return;
    }

    const marcelo = masterShop.staff.find(s => s.name.includes('Marcelo'));
    if (!marcelo) {
        console.error("Marcelo not found");
        return;
    }

    console.log(`Reassigning all NextApp data created today to Marcelo (${marcelo.id})...`);

    // 1. Appointments
    const apptResult = await prisma.appointment.updateMany({
        where: {
            barbershopId: masterShop.id,
            createdAt: { gte: today },
            professionalId: { not: marcelo.id },
            // only COMPLETED fake ones or pending from today
        },
        data: {
            professionalId: marcelo.id
        }
    });

    // 2. Transactions
    const txResult = await prisma.transaction.updateMany({
        where: {
            barbershopId: masterShop.id,
            createdAt: { gte: today },
            professionalId: { not: null, not: marcelo.id }
        },
        data: {
            professionalId: marcelo.id
        }
    });

    // 3. Commissions
    const commResult = await prisma.commission.updateMany({
        where: {
            barbershopId: masterShop.id,
            createdAt: { gte: today },
            barberId: { not: marcelo.id }
        },
        data: {
            barberId: marcelo.id
        }
    });

    // 4. Waitlist
    const waitlistResult = await prisma.waitlist.updateMany({
        where: {
            barbershopId: masterShop.id,
            createdAt: { gte: today },
            professionalId: { not: null, not: marcelo.id }
        },
        data: {
            professionalId: marcelo.id
        }
    });

    console.log(`Fixed Appointments: ${apptResult.count}`);
    console.log(`Fixed Transactions: ${txResult.count}`);
    console.log(`Fixed Commissions: ${commResult.count}`);
    console.log(`Fixed Waitlist: ${waitlistResult.count}`);

}

fixFakeData().catch(console.error).finally(() => prisma.$disconnect());
