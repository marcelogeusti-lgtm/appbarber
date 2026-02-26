const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Listing All Pros ---');

        const pros = await prisma.user.findMany({
            where: {
                professionalProfile: { isNot: null }
            },
            include: {
                professionalProfile: {
                    include: { schedules: true }
                },
                workedBarbershop: true
            }
        });

        console.log(`Found ${pros.length} professionals with profile.`);

        for (const pro of pros) {
            console.log(`\nID: ${pro.id}`);
            console.log(`Name: ${pro.name}`);
            console.log(`Active: ${pro.active}`);
            console.log(`Shop: ${pro.workedBarbershop?.name} (${pro.workedBarbershopId})`);
            console.log(`Schedules: ${pro.professionalProfile.schedules.length}`);
            if (pro.professionalProfile.schedules.length > 0) {
                console.log(`First Schedule: Day ${pro.professionalProfile.schedules[0].dayOfWeek}, ${pro.professionalProfile.schedules[0].startTime}-${pro.professionalProfile.schedules[0].endTime}`);
            }
        }

    } catch (error) {
        console.error('FAILURE:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
