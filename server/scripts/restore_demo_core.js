const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function restoreDemo() {
    try {
        console.log('--- RESTORE PERFECT DEMO ---');

        // 1. Get Master User
        const master = await prisma.user.findUnique({
            where: { email: 'marcelogeusti@gmail.com' }
        });
        if (!master) throw new Error('Master user not found');

        // 2. Recreate NEXT Barbershop
        const nextShop = await prisma.barbershop.upsert({
            where: { slug: 'next' },
            update: {
                name: 'NextApp',
                commercialName: 'NextApp',
                legalName: 'NextApp Gestão Barber',
                ownerId: master.id,
                subscriptionStatus: 'ACTIVE',
                saasPlan: 'PREMIUM',
                address: 'Av. Paulista, 1000 - São Paulo, SP',
                latitude: -23.5614,
                longitude: -46.6559,
                slug: 'next'
            },
            create: {
                name: 'NextApp',
                commercialName: 'NextApp',
                legalName: 'NextApp Gestão Barber',
                ownerId: master.id,
                subscriptionStatus: 'ACTIVE',
                saasPlan: 'PREMIUM',
                address: 'Av. Paulista, 1000 - São Paulo, SP',
                latitude: -23.5614,
                longitude: -46.6559,
                slug: 'next'
            }
        });
        console.log(`Restored Shop: ${nextShop.name} (${nextShop.id})`);

        // 3. Link Master back to NEXT
        await prisma.user.update({
            where: { id: master.id },
            data: { workedBarbershopId: nextShop.id }
        });

        // 4. Restore Services
        const serviceData = [
            { name: 'Corte Social', price: 50.00, duration: 30, description: 'Corte clássico e elegante' },
            { name: 'Corte + Barba', price: 85.00, duration: 60, description: 'Combo completo premium' },
            { name: 'Barboterapia', price: 40.00, duration: 30, description: 'Tratamento com toalha quente' }
        ];

        for (const s of serviceData) {
            await prisma.service.upsert({
                where: { 
                    name_barbershopId: { name: s.name, barbershopId: nextShop.id }
                },
                update: s,
                create: { ...s, barbershopId: nextShop.id }
            });
        }
        const allServices = await prisma.service.findMany({ where: { barbershopId: nextShop.id } });
        console.log(`Restored ${allServices.length} services`);

        // 5. Restore Professionals
        const rafaData = {
            email: 'rafaelfonseca@gmail.com',
            name: 'Rafael Fonseca',
            role: 'BARBER',
            workedBarbershopId: nextShop.id,
            active: true
        };

        let rafa = await prisma.user.findUnique({ where: { email: rafaData.email } });
        if (!rafa) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            const authUser = await prisma.authUser.create({
                data: { email: rafaData.email, password: hashedPassword, provider: 'EMAIL' }
            });
            rafa = await prisma.user.create({
                data: { ...rafaData, authUserId: authUser.id }
            });
        } else {
            rafa = await prisma.user.update({
                where: { id: rafa.id },
                data: { workedBarbershopId: nextShop.id }
            });
        }

        // Professional Profiles
        const proProfiles = [
            { userId: master.id, position: 'PROPRIETÁRIO / PROFISSIONAL', commissionPercent: 0 },
            { userId: rafa.id, position: 'BARBEIRO', commissionPercent: 50 }
        ];

        for (const p of proProfiles) {
            await prisma.professional.upsert({
                where: { userId: p.userId },
                update: p,
                create: { 
                    ...p, 
                    appointmentInterval: 30,
                    showInApp: true,
                    showPublicly: true,
                    services: { connect: allServices.map(s => ({ id: s.id })) }
                }
            });
        }
        console.log('Restored Professional Profiles (Marcelo & Rafael)');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

restoreDemo();
