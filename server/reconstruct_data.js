const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🏗 Starting Local Data Reconstruction...');

    try {
        const password = await bcrypt.hash('G@usti8826', 10);

        // 1. Restore Master Account
        const masterAuth = await prisma.authUser.upsert({
            where: { email: 'marcelogeusti@gmail.com' },
            update: { password },
            create: {
                email: 'marcelogeusti@gmail.com',
                password,
                provider: 'EMAIL'
            }
        });

        const masterUser = await prisma.user.upsert({
            where: { authUserId: masterAuth.id },
            update: { role: 'SUPER_ADMIN', name: 'Marcelo Pereira Geusti' },
            create: {
                name: 'Marcelo Pereira Geusti',
                email: 'marcelogeusti@gmail.com',
                role: 'SUPER_ADMIN',
                authUserId: masterAuth.id
            }
        });
        console.log('✅ Master Account Restored');

        // 2. Restore Barbershop Owner Account
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
            update: { role: 'ADMIN', name: 'Marcelo Geusti' },
            create: {
                name: 'Marcelo Geusti',
                email: 'marcelo@barber.com',
                role: 'ADMIN',
                authUserId: ownerAuth.id
            }
        });
        console.log('✅ Owner Account Restored');

        // 3. Restore Barbershop (NextApp)
        const barbershop = await prisma.barbershop.upsert({
            where: { id: '94dad01c-504e-4f93-bcfe-5371d5a7ee50' },
            update: { ownerId: owner.id, name: 'NextApp', slug: 'next' },
            create: {
                id: '94dad01c-504e-4f93-bcfe-5371d5a7ee50',
                name: 'NextApp',
                slug: 'next',
                ownerId: owner.id
            }
        });

        await prisma.user.update({
            where: { id: owner.id },
            data: { workedBarbershopId: barbershop.id }
        });
        console.log('✅ Barbershop NextApp Restored');

        // 4. Restore Services (using found IDs to maintain appointment links)
        const serviceData = [
            { id: '69ea2ec7-3411-43bf-a28b-12c96857710d', name: 'Corte de Cabelo Premium', price: 50, duration: 30 },
            { id: '0f7fd72c-4b36-41c8-b6fb-d4283eef1838', name: 'Barba Tradicional', price: 35, duration: 30 },
            { id: '46852b88-4a0e-4df3-bbb0-8dd1aed9cb40', name: 'Corte & Barba', price: 75, duration: 60 }
        ];

        for (const s of serviceData) {
            await prisma.service.upsert({
                where: { id: s.id },
                update: { name: s.name, price: s.price, duration: s.duration, barbershopId: barbershop.id, active: true },
                create: { ...s, barbershopId: barbershop.id, active: true }
            });
        }
        console.log('✅ Services Restored');

        // 5. Restore Professional (Rafael Fonseca)
        const rafaelAuth = await prisma.authUser.upsert({
            where: { email: 'rafaelfonseca@gmail.com' },
            update: { password },
            create: {
                email: 'rafaelfonseca@gmail.com',
                password,
                provider: 'EMAIL'
            }
        });

        const rafaelUser = await prisma.user.upsert({
            where: { authUserId: rafaelAuth.id },
            update: { role: 'BARBER', name: 'Rafael Fonseca', workedBarbershopId: barbershop.id },
            create: {
                name: 'Rafael Fonseca',
                email: 'rafaelfonseca@gmail.com',
                role: 'BARBER',
                authUserId: rafaelAuth.id,
                workedBarbershopId: barbershop.id
            }
        });

        // Professional Profile
        await prisma.professional.upsert({
            where: { userId: rafaelUser.id },
            update: { position: 'Barbeiro Master' },
            create: { userId: rafaelUser.id, position: 'Barbeiro Master' }
        });
        console.log('✅ Professional Rafael Fonseca Restored');

        console.log('✨ Environment Reconstructed! Site should be functional now.');

    } catch (e) {
        console.error('❌ Reconstruction Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
