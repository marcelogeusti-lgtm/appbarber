const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- SYSTEM RECOVERY: RESTORING MASTER BARBERSHOP ---');

    // 1. Find the Master User
    const masterUser = await prisma.user.findFirst({
        where: { email: { contains: 'master', mode: 'insensitive' } }
    });

    if (!masterUser) {
        console.error('❌ Master user not found! Please ensure the Master account exists.');
        return;
    }

    console.log(`✅ Found Master User: ${masterUser.name} (${masterUser.id})`);

    // 2. Create the Barbershop
    // We use a transaction to ensure everything is linked correctly
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Check if shop already exists
            let shop = await tx.barbershop.findFirst({
                where: { ownerId: masterUser.id }
            });

            if (!shop) {
                console.log('Creating new primary barbershop...');
                shop = await tx.barbershop.create({
                    data: {
                        name: 'Barbearia Master',
                        slug: 'barbearia-master',
                        address: 'Rua Principal, 123',
                        phone: '11999999999',
                        ownerId: masterUser.id,
                        staff: { connect: { id: masterUser.id } }
                    }
                });
            } else {
                console.log('✅ Barbershop already exists.');
            }

            // 3. Ensure Master User is linked and has correct role
            await tx.user.update({
                where: { id: masterUser.id },
                data: {
                    role: 'SUPER_ADMIN',
                    workedBarbershopId: shop.id,
                    active: true
                }
            });

            // 4. Create a default professional profile if missing
            await tx.professional.upsert({
                where: { userId: masterUser.id },
                update: {
                    position: 'Administrador / Barbeiro',
                    showInApp: true,
                    showPublicly: true
                },
                create: {
                    userId: masterUser.id,
                    position: 'Administrador / Barbeiro',
                    showInApp: true,
                    showPublicly: true
                }
            });

            return shop;
        });

        console.log(`\n🎉 RECOVERY COMPLETE!`);
        console.log(`Shop ID: ${result.id}`);
        console.log(`Slug: ${result.slug}`);
        console.log(`Owner: ${masterUser.name}`);
        console.log('You can now log in and manage your team and services.');

    } catch (error) {
        console.error('❌ Recovery failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
