const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'marcelogeusti@gmail.com';
    console.log(`Checking gateway config for user: ${email}`);

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

    const barbershop = authUser.user.ownedBarbershops[0];
    if (!barbershop) {
        console.log('No barbershop owned by this user.');
        return;
    }

    console.log(`Barbershop found: ${barbershop.name} (${barbershop.id})`);

    const configs = await prisma.gatewayConfig.findMany({
        where: { barbershopId: barbershop.id }
    });

    console.log('Gateway Configs:', JSON.stringify(configs, null, 2));

    if (configs.length === 0) {
        console.log('No gateway configs found. Orchestrator defaults to Velfy with empty credentials.');

        // AUTO FAULT FIX: Create a default Velfy config if none exists, using mock credentials for dev
        console.log('Creating default Velfy config for testing...');
        await prisma.gatewayConfig.create({
            data: {
                barbershopId: barbershop.id,
                gateway: 'VELFY',
                isActive: true,
                credentials: {
                    publicKey: 'pk_test_123',
                    secretKey: 'sk_test_123'
                }
            }
        });
        console.log('Default Velfy config created.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
