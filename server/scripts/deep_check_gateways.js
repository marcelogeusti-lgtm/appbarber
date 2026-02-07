const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'marcelogeusti@gmail.com';
    console.log(`Deep Dive for user: ${email}`);

    const authUser = await prisma.authUser.findUnique({
        where: { email },
        include: {
            user: {
                include: { ownedBarbershops: true, workedBarbershop: true }
            }
        }
    });

    if (!authUser || !authUser.user) {
        console.log('User not found.');
        return;
    }

    const shops = authUser.user.ownedBarbershops;
    console.log(`User owns ${shops.length} barbershops.`);

    for (const shop of shops) {
        console.log(`\n--- Barbershop: ${shop.name} (${shop.id}) ---`);
        const configs = await prisma.gatewayConfig.findMany({
            where: { barbershopId: shop.id }
        });

        if (configs.length === 0) {
            console.log('  No Gateway Configs found.');
        } else {
            configs.forEach(c => {
                // Mask secrets
                const safeCreds = { ...c.credentials };
                if (safeCreds.secretKey) safeCreds.secretKey = '***';
                if (safeCreds.accessToken) safeCreds.accessToken = '***';

                console.log(`  Gateway: ${c.gateway} | Active: ${c.isActive} | Updated: ${c.updatedAt}`);
                console.log(`  Creds: ${JSON.stringify(safeCreds)}`);
            });
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
