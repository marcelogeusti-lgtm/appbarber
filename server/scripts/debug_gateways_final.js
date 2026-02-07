const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'marcelogeusti@gmail.com';
    console.log(`Deep Dive for user: ${email}`);

    const authUser = await prisma.authUser.findUnique({
        where: { email },
        include: {
            user: {
                include: { ownedBarbershops: true }
            }
        }
    });

    if (!authUser || !authUser.user) {
        console.log('User not found.');
        return;
    }

    const shops = authUser.user.ownedBarbershops;

    for (const shop of shops) {
        console.log(`\n--- Barbershop: ${shop.name} (${shop.id}) ---`);
        const configs = await prisma.gatewayConfig.findMany({
            where: { barbershopId: shop.id }
        });

        console.log(`Found ${configs.length} configs:`);
        configs.forEach(c => {
            console.log(`- Gateway: ${c.gateway} | Active: ${c.isActive}`);
            console.log(`  Keys: ${Object.keys(c.credentials).join(', ')}`);
            // Mask values for safety but show if they exist
            const maskedCreds = {};
            for (const key in c.credentials) {
                const val = String(c.credentials[key]);
                maskedCreds[key] = val.length > 6 ? `${val.substring(0, 3)}...${val.substring(val.length - 3)}` : '***';
            }
            console.log(`  Values: ${JSON.stringify(maskedCreds)}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
