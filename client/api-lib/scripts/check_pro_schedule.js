const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const proId = '645a56d5-22d7-46b5-a692-5e70ccbe5d5c';
    try {
        const schedules = await prisma.schedule.findMany({
            where: { professional: { userId: proId } }
        });
        console.log('--- SCHEDULES ---');
        console.log(JSON.stringify(schedules, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
