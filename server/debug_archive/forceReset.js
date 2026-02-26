const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function forceReset() {
    const email = 'marcelogeusti@gmail.com';
    const user = await prisma.user.findFirst({
        where: { email },
        include: { professionalProfile: true }
    });

    if (!user || !user.professionalProfile) {
        console.log('No user or professional profile found.');
        return;
    }

    const proId = user.professionalProfile.id;
    console.log(`Resetting Professional Profile for ${user.name} (ProID: ${proId})`);

    try {
        await prisma.$transaction([
            // 1. Delete Schedules
            prisma.schedule.deleteMany({ where: { professionalId: proId } }),

            // 2. Clear Service Associations (if any)
            // Professional model in schema has many-to-many services
            // But let's check the relation name

            // 3. Delete the Professional Record
            prisma.professional.delete({ where: { id: proId } })
        ]);
        console.log('FORCE RESET SUCCESSFUL.');
    } catch (err) {
        console.error('FAILED TO RESET:', err.message);
    }
}

forceReset().catch(console.error).finally(() => prisma.$disconnect());
