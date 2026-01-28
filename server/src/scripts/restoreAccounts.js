const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🚀 Starting Data Restoration...');

    try {
        const password = await bcrypt.hash('G@usti8826', 10);

        // 1. Create MASTER Account
        const masterAuth = await prisma.authUser.upsert({
            where: { email: 'marcelogeusti@gmail.com' },
            update: { password },
            create: {
                email: 'marcelogeusti@gmail.com',
                password,
                provider: 'EMAIL'
            }
        });

        await prisma.user.upsert({
            where: { authUserId: masterAuth.id },
            update: { role: 'SUPER_ADMIN', name: 'Marcelo Pereira Geusti' },
            create: {
                name: 'Marcelo Pereira Geusti',
                email: 'marcelogeusti@gmail.com',
                role: 'SUPER_ADMIN',
                authUserId: masterAuth.id
            }
        });
        console.log('✅ Master Account Restored: marcelogeusti@gmail.com / 123456');

        // 2. Create BARBERSHOP OWNER Account (Marcelo)
        const ownerAuth = await prisma.authUser.upsert({
            where: { email: 'marcelo@barber.com' },
            update: { password },
            create: {
                email: 'marcelo@barber.com',
                password,
                provider: 'EMAIL'
            }
        });

        const owner = await prisma.user.upsert({
            where: { authUserId: ownerAuth.id },
            update: { role: 'ADMIN' },
            create: {
                name: 'Marcelo Geusti',
                email: 'marcelo@barber.com',
                role: 'ADMIN',
                authUserId: ownerAuth.id
            }
        });

        // 3. Create Barbershop
        const barbershop = await prisma.barbershop.create({
            data: {
                name: 'Barbearia Geusti',
                slug: 'barbearia-geusti',
                ownerId: owner.id,
                staff: { connect: { id: owner.id } }
            }
        });

        await prisma.user.update({
            where: { id: owner.id },
            data: { workedBarbershopId: barbershop.id }
        });

        console.log('✅ Owner Account Restored: marcelo@barber.com / 123456');
        console.log('✅ Barbershop Restored: Barbearia Geusti');

    } catch (error) {
        console.error('❌ Restoration Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
