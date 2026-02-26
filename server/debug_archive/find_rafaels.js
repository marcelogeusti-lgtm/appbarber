const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Finding Rafael Fonsecas ---');
        const rafaels = await prisma.user.findMany({
            where: { name: { contains: 'Rafael Fonseca' } },
            include: {
                workedBarbershop: true,
                professionalProfile: {
                    include: { schedules: true }
                }
            }
        });

        console.log(`Found ${rafaels.length} matches.`);

        for (const r of rafaels) {
            console.log(`\nID: ${r.id}`);
            console.log(`Email: ${r.email}`);
            console.log(`Active: ${r.active}`);
            console.log(`Shop: ${r.workedBarbershop?.name} (${r.workedBarbershopId})`);
            console.log(`Schedules: ${r.professionalProfile?.schedules?.length || 0}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
