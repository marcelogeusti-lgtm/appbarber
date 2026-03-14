const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function fullRestoration() {
    try {
        console.log('--- FULL SYSTEM RESTORATION & DATA RECOVERY ---');

        // 1. Get/Verify Master User
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
                longitude: -46.6559
            },
            create: {
                name: 'NextApp',
                commercialName: 'NextApp',
                legalName: 'NextApp Gestão Barber',
                ownerId: master.id,
                slug: 'next',
                subscriptionStatus: 'ACTIVE',
                saasPlan: 'PREMIUM',
                address: 'Av. Paulista, 1000 - São Paulo, SP',
                latitude: -23.5614,
                longitude: -46.6559
            }
        });
        console.log(`Phase 1: Shop 'NEXT' is OK. ID: ${nextShop.id}`);

        // 3. Ensure Master is linked as staff too
        await prisma.user.update({
            where: { id: master.id },
            data: { workedBarbershopId: nextShop.id }
        });

        // 4. Restore Services (using find/create since no unique index)
        const serviceData = [
            { name: 'Corte Social', price: 50.00, duration: 30, description: 'Corte clássico e elegante' },
            { name: 'Corte + Barba', price: 85.00, duration: 60, description: 'Combo completo premium' },
            { name: 'Barboterapia', price: 40.00, duration: 30, description: 'Tratamento com toalha quente' }
        ];

        for (const s of serviceData) {
            let existing = await prisma.service.findFirst({
                where: { name: s.name, barbershopId: nextShop.id }
            });
            if (!existing) {
                await prisma.service.create({
                    data: { ...s, barbershopId: nextShop.id }
                });
            } else {
                await prisma.service.update({
                    where: { id: existing.id },
                    data: s
                });
            }
        }
        const allServices = await prisma.service.findMany({ where: { barbershopId: nextShop.id } });
        console.log(`Phase 2: Services restored (${allServices.length})`);

        // 5. Restore Rafael Fonseca
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

        // 6. Professional Profiles
        const prosToRestore = [
            { userId: master.id, position: 'PROPRIETÁRIO / PROFISSIONAL' },
            { userId: rafa.id, position: 'BARBEIRO' }
        ];

        for (const p of prosToRestore) {
            await prisma.professional.upsert({
                where: { userId: p.userId },
                update: {
                    position: p.position,
                    showInApp: true,
                    showPublicly: true,
                    services: { connect: allServices.map(s => ({ id: s.id })) }
                },
                create: {
                    userId: p.userId,
                    position: p.position,
                    showInApp: true,
                    showPublicly: true,
                    services: { connect: allServices.map(s => ({ id: s.id })) }
                }
            });
        }
        console.log('Phase 3: Professionals restored.');

        // 7. Generate Data (Today R$ 1.280)
        console.log('Phase 4: Generating Mock Data...');
        
        // Create Clients
        const clients = [];
        for (let i = 1; i <= 30; i++) {
            const phone = `119${String(i).padStart(8, '6')}`;
            let client = await prisma.client.findUnique({ where: { phone } });
            if (!client) {
                client = await prisma.client.create({
                    data: { name: `Cliente Demo ${i}`, phone: phone, active: true }
                });
            }
            clients.push(client);
        }

        // Clear data for this shop to be fresh
        await prisma.orderItem.deleteMany({ where: { order: { barbershopId: nextShop.id } } });
        await prisma.order.deleteMany({ where: { barbershopId: nextShop.id } });
        await prisma.appointment.deleteMany({ where: { barbershopId: nextShop.id } });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const allPros = [master, rafa];

        let revenue = 0;
        for (let i = 0; i < 25; i++) {
            const pro = allPros[i % allPros.length];
            const client = clients[i % clients.length];
            const service = allServices[i % allServices.length];
            const time = new Date(today);
            time.setHours(8 + Math.floor(i / 2), (i % 2) * 30, 0, 0);

            const apt = await prisma.appointment.create({
                data: {
                    barbershopId: nextShop.id,
                    professionalId: pro.id,
                    clientId: client.id,
                    serviceId: service.id,
                    date: time,
                    status: 'COMPLETED',
                    paymentStatus: 'PAID'
                }
            });

            const order = await prisma.order.create({
                data: {
                    barbershopId: nextShop.id,
                    appointmentId: apt.id,
                    clientId: client.id,
                    professionalId: pro.id,
                    status: 'CLOSED',
                    paymentStatus: 'PAID',
                    paymentMethod: 'PIX',
                    subtotal: Number(service.price),
                    total: Number(service.price),
                    paidAt: time
                }
            });

            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    type: 'SERVICE',
                    serviceId: service.id,
                    quantity: 1,
                    unitPrice: Number(service.price),
                    total: Number(service.price)
                }
            });
            revenue += Number(service.price);
        }

        // Adjust to 1280
        if (revenue < 1280) {
            await prisma.order.create({
                data: {
                    barbershopId: nextShop.id,
                    clientId: clients[0].id,
                    professionalId: master.id,
                    status: 'CLOSED',
                    paymentStatus: 'PAID',
                    paymentMethod: 'CREDIT_CARD',
                    subtotal: 1280 - revenue,
                    total: 1280 - revenue,
                    paidAt: new Date(),
                    notes: 'Ajuste Demo Revenue'
                }
            });
        }
        
        console.log('Restoration Complete.');

    } catch (e) {
        console.error('CRITICAL ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fullRestoration();
