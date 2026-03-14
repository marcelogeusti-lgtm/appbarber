const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    try {
        const shops = await prisma.barbershop.findMany({
            where: {
                OR: [
                    { commercialName: null },
                    { legalName: null }
                ]
            }
        });
        
        console.log(`Found ${shops.length} shops to fix`);

        for (const shop of shops) {
            await prisma.barbershop.update({
                where: { id: shop.id },
                data: {
                    commercialName: shop.commercialName || shop.name,
                    legalName: shop.legalName || shop.name
                }
            });
            console.log(`Fixed shop: ${shop.name}`);
        }

        // Also ensure location is set for "Waniely" if possible
        const waniely = await prisma.barbershop.findFirst({
            where: { name: { contains: 'Waniely', mode: 'insensitive' } }
        });
        if (waniely && !waniely.latitude) {
            await prisma.barbershop.update({
                where: { id: waniely.id },
                data: {
                    // Set a default center near Sorocaba/SP if no address matches, 
                    // but user said it "adicionou endereço".
                    // For now, let's just ensure names are fixed.
                }
            });
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
