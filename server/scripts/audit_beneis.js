const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    try {
        console.log('--- AUDITING BENEIS BARBERSHOP ---');
        
        const shop = await prisma.barbershop.findFirst({
            where: {
                OR: [
                    { name: { contains: 'Beneis', mode: 'insensitive' } },
                    { slug: { contains: 'benites', mode: 'insensitive' } }
                ]
            },
            include: {
                owner: true,
                gatewayConfigs: true,
                services: true
            }
        });

        if (!shop) {
            console.log('Barbershop not found!');
            // List all shops just in case
            const allShops = await prisma.barbershop.findMany({ select: { id: true, name: true, slug: true } });
            console.log('All shops:', allShops);
            return;
        }

        console.log('Shop Data:', JSON.stringify(shop, null, 2));

        // Check for specific fields the user mentioned might be missing
        const rawModel = await prisma.$queryRaw`SELECT * FROM "Barbershop" WHERE id = ${shop.id} LIMIT 1`;
        console.log('Raw DB Row (to check for non-prisma fields):', JSON.stringify(rawModel, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

audit();
