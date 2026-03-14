const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateMockData() {
    try {
        console.log('--- GENERATING PERFECT MOCK DATA ---');

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

        // 1. Create 50 unique clients if not exists
        console.log('Generating clients...');
        const clients = [];
        for (let i = 1; i <= 50; i++) {
            const phone = `119${String(i).padStart(8, '4')}${String(i).padStart(2, '0')}`;
            const client = await prisma.client.upsert({
                where: { phone: phone },
                update: { active: true },
                create: {
                    name: `Cliente Demo ${i}`,
                    phone: phone,
                    email: `cliente${i}@demo.com`,
                    theme: 'dark',
                    active: true
                }
            });
            clients.push(client);
        }

        // 2. Generate Today's Data (Goal: ~23 appointments, R$ 1.280 revenue)
        console.log('Generating today\'s data...');
        const today = new Date();
        const startOfToday = new Date(today);
        startOfToday.setHours(8, 0, 0, 0);

        let currentRevenue = 0;
        const targetRevenue = 1280;
        let appointmentCount = 0;

        // Appointments Today
        for (let i = 0; i < 30; i++) {
            const pro = allPros[i % allPros.length];
            const client = clients[i % clients.length];
            const service = services[i % services.length];

            const time = new Date(startOfToday);
            time.setMinutes(i * 30);

            if (time.getHours() > 21) break;

            const apt = await prisma.appointment.create({
                data: {
                    barbershopId: nextShop.id,
                    professionalId: pro.id,
                    clientId: client.id,
                    serviceId: service.id,
                    date: time,
                    status: i < 23 ? 'COMPLETED' : 'CONFIRMED',
                    paymentStatus: i < 23 ? 'PAID' : 'PENDING',
                    notes: 'Agendamento Demo'
                }
            });

            if (i < 23) {
                // Create Order for completed ones
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
                        paidAt: time,
                        updatedAt: time 
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

        // Adjust revenue to hit ~1280 exactly if needed (adding a high-value manual order)
        if (currentRevenue < targetRevenue) {
            const diff = targetRevenue - currentRevenue;
            const pro = allPros[0];
            const client = clients[0];
            const order = await prisma.order.create({
                data: {
                    barbershopId: nextShop.id,
                    clientId: client.id,
                    professionalId: pro.id,
                    status: 'CLOSED',
                    paymentStatus: 'PAID',
                    paymentMethod: 'CREDIT_CARD',
                    subtotal: diff,
                    total: diff,
                    updatedAt: new Date()
                }
            });
            console.log(`Added adjustment order: R$ ${diff}`);
        }

        console.log(`Generated snapshot: ${appointmentCount} appointments today, approx R$ ${targetRevenue} revenue.`);

        // 3. Historical Data (past 7 days)
        console.log('Generating historical data...');
        for (let d = 1; d <= 7; d++) {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - d);
            pastDate.setHours(10, 0, 0, 0);

            for (let i = 0; i < 5; i++) {
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
                        clientName: client.name,
                        clientPhone: client.phone,
                        date: time,
                        startTime: time,
                        endTime: new Date(new Date(time).setMinutes(time.getMinutes() + service.duration)),
                        status: 'COMPLETED',
                        paymentStatus: 'PAID'
                    }
                });

                await prisma.order.create({
                    data: {
                        barbershopId: nextShop.id,
                        appointmentId: apt.id,
                        clientId: client.id,
                        professionalId: pro.id,
                        status: 'CLOSED',
                        paymentStatus: 'PAID',
                        paymentMethod: 'MONEY',
                        subtotal: Number(service.price),
                        total: Number(service.price),
                        updatedAt: time
                    }
                });
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

generateMockData();
