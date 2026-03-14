const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateMockData() {
    try {
        console.log('--- GENERATING PERFECT MOCK DATA V2 ---');

        const nextShop = await prisma.barbershop.findUnique({ where: { slug: 'next' } });
        if (!nextShop) throw new Error('NEXT shop not found');

        const professionals = await prisma.user.findMany({
            where: { workedBarbershopId: nextShop.id, role: 'BARBER' }
        });
        const master = await prisma.user.findFirst({
            where: { email: 'marcelogeusti@gmail.com' }
        });
        const allPros = [...professionals, master].filter(p => !!p);

        const services = await prisma.service.findMany({ where: { barbershopId: nextShop.id } });

        // 1. Create Clients one by one
        console.log('Generating clients...');
        const clients = [];
        for (let i = 1; i <= 50; i++) {
            const phone = `1198888${String(i).padStart(4, '0')}`;
            let client = await prisma.client.findUnique({ where: { phone } });
            if (!client) {
                client = await prisma.client.create({
                    data: {
                        name: `Cliente Demo ${i}`,
                        phone: phone,
                        email: `cliente${i}@demo.com`,
                        active: true
                    }
                });
            }
            clients.push(client);
        }

        // 2. Clear existing appointments/orders for this shop to avoid duplicates
        console.log('Cleaning existing demo entries for shop...');
        await prisma.orderItem.deleteMany({ where: { order: { barbershopId: nextShop.id } } });
        await prisma.order.deleteMany({ where: { barbershopId: nextShop.id } });
        await prisma.appointment.deleteMany({ where: { barbershopId: nextShop.id } });

        // 3. Generate Today's Data (Goal: ~23 completed, R$ 1.280 revenue)
        console.log('Generating today\'s data...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentRevenue = 0;
        const targetRevenue = 1280;
        let appointmentCount = 0;

        for (let i = 0; i < 30; i++) {
            const pro = allPros[i % allPros.length];
            const client = clients[i % clients.length];
            const service = services[i % services.length];

            const time = new Date(today);
            time.setHours(8 + Math.floor(i / 2), (i % 2) * 30, 0, 0);

            if (time.getHours() > 21) break;

            const isCompleted = i < 23;

            const apt = await prisma.appointment.create({
                data: {
                    barbershopId: nextShop.id,
                    professionalId: pro.id,
                    clientId: client.id,
                    serviceId: service.id,
                    date: time,
                    status: isCompleted ? 'COMPLETED' : 'CONFIRMED',
                    paymentStatus: isCompleted ? 'PAID' : 'PENDING'
                }
            });

            if (isCompleted) {
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
                currentRevenue += Number(service.price);
            }
            appointmentCount++;
        }

        // Adjust to exactly 1280
        if (currentRevenue < targetRevenue) {
            const diff = targetRevenue - currentRevenue;
            const pro = allPros[0];
            const client = clients[0];
            await prisma.order.create({
                data: {
                    barbershopId: nextShop.id,
                    clientId: client.id,
                    professionalId: pro.id,
                    status: 'CLOSED',
                    paymentStatus: 'PAID',
                    paymentMethod: 'CREDIT_CARD',
                    subtotal: diff,
                    total: diff,
                    paidAt: new Date(),
                    notes: 'Ajuste de Receita Demo'
                }
            });
        }

        console.log(`Snapshot generated. Status: OK.`);

        // 4. Past 7 days historical
        console.log('Generating historical week...');
        for (let d = 1; d <= 7; d++) {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - d);
            pastDate.setHours(10, 0, 0, 0);

            for (let i = 0; i < 8; i++) {
                const pro = allPros[i % allPros.length];
                const client = clients[(i + d) % clients.length];
                const service = services[i % services.length];

                const time = new Date(pastDate);
                time.setMinutes(i * 60);

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
            }
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

generateMockData();
