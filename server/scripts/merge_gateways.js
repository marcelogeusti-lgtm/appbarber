const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const barbershopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50';
    console.log(`Merging duplicates for Barbershop: ${barbershopId}`);

    const configs = await prisma.gatewayConfig.findMany({
        where: { barbershopId }
    });

    // Group by normalized name
    const groups = {};
    configs.forEach(c => {
        const norm = c.gateway.toUpperCase();
        if (!groups[norm]) groups[norm] = [];
        groups[norm].push(c);
    });

    for (const norm in groups) {
        const list = groups[norm];
        if (list.length > 1) {
            console.log(`Fixing duplicates for ${norm}...`);
            // Find the "best" one (active, or newest if none active)
            const best = list.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0) || new Date(b.updatedAt) - new Date(a.updatedAt))[0];

            // Delete ALL others and ensure the best one is Uppercase
            for (const item of list) {
                if (item.id !== best.id) {
                    await prisma.gatewayConfig.delete({ where: { id: item.id } });
                }
            }

            // Standardize the best one
            await prisma.gatewayConfig.update({
                where: { id: best.id },
                data: { gateway: norm }
            });
        } else {
            // Even if solo, ensure uppercase
            await prisma.gatewayConfig.update({
                where: { id: list[0].id },
                data: { gateway: norm }
            });
        }
    }

    console.log('Merge complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
