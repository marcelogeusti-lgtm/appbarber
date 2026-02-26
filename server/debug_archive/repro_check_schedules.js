const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const proId = 'c96a1303-d42c-48fc-a2a3-3bcd31a2bae2'; // Rafael Fonseca

        console.log(`Checking Schedules for Pro: ${proId}`);

        const pro = await prisma.user.findUnique({
            where: { id: proId },
            include: {
                professionalProfile: {
                    include: {
                        schedules: {
                            orderBy: { dayOfWeek: 'asc' }
                        }
                    }
                }
            }
        });

        if (!pro) {
            console.log('Pro not found');
            return;
        }

        const schedules = pro.professionalProfile?.schedules || [];
        console.log(`Total Schedules: ${schedules.length}`);

        schedules.forEach(s => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            console.log(`Day ${s.dayOfWeek} (${days[s.dayOfWeek]}): ${s.startTime} - ${s.endTime} | isOff: ${s.isOff} | Break: ${s.breakStart}-${s.breakEnd}`);
        });

    } catch (error) {
        console.error('FAILURE:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
