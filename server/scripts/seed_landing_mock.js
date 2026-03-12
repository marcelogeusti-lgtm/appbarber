const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { randomUUID } = require('crypto');
const { addDays, subDays, setHours, setMinutes, format } = require('date-fns');

const DEMO_SLUG = 'next-demo-marketing';
const OWNER_EMAIL = 'demo@corteconexao.com.br';

const SERVICES_DATA = [
    { name: 'Corte Clássico', price: 40, duration: 30 },
    { name: 'Corte + Barba', price: 70, duration: 60 },
    { name: 'Barba Terapia', price: 35, duration: 30 },
    { name: 'Degradê/Fade', price: 45, duration: 45 },
    { name: 'Pigmentação', price: 25, duration: 30 },
    { name: 'Sombrancelha', price: 15, duration: 15 },
    { name: 'Combo VIP', price: 80, duration: 60 },
];

const PRODUCTS_DATA = [
    { name: 'Pomada Efeito Matte', price: 45, costPrice: 20 },
    { name: 'Óleo para Barba', price: 35, costPrice: 15 },
    { name: 'Shampoo Mentolado', price: 55, costPrice: 25 },
    { name: 'Gel Fixador Ultra', price: 25, costPrice: 10 },
];

const BARBERS = [
    { name: 'Marcelo Maestro', email: 'marcelo@nextdemo.com', position: 'Master Barber' },
    { name: 'Rafael Costa', email: 'rafael@nextdemo.com', position: 'Senior Barber' },
    { name: 'Betinho', email: 'betinho@nextdemo.com', position: 'Barber' },
    { name: 'Lucas Oliveira', email: 'lucas@nextdemo.com', position: 'Barber' },
];

const FIRST_NAMES = ["João", "Carlos", "Pedro", "Lucas", "Mateus", "Rafael", "Felipe", "André", "Marcos", "Thiago", "Bruno", "Caio", "Diego", "Enzo", "Gabriel", "Henrique", "Igor", "Julio", "Leonardo", "Marcelo", "Natan", "Otávio", "Paulo", "Ricardo", "Samuel", "Tiago", "Vinicius", "William", "Yuri", "Zeca"];
const LAST_NAMES = ["Silva", "Souza", "Santos", "Oliveira", "Pereira", "Lima", "Carvalho", "Ferreira", "Costa", "Gomes", "Martins", "Araujo", "Melo", "Barbosa", "Ribeiro", "Alves", "Rocha", "Nunes", "Mendes", "Vieira"];

function getRandomName() {
    return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
}

async function wipeDemoData() {
    console.log('Cleaning up existing demo data...');
    const shop = await prisma.barbershop.findUnique({ where: { slug: DEMO_SLUG } });
    if (shop) {
        await prisma.transaction.deleteMany({ where: { barbershopId: shop.id } });
        await prisma.appointment.deleteMany({ where: { barbershopId: shop.id } });
        await prisma.noShowRecord.deleteMany({ where: { barbershopId: shop.id } });
        await prisma.orderItem.deleteMany({ where: { order: { barbershopId: shop.id } } });
        await prisma.order.deleteMany({ where: { barbershopId: shop.id } });
        await prisma.commission.deleteMany({ where: { barbershopId: shop.id } });
        await prisma.waitlist.deleteMany({ where: { barbershopId: shop.id } });
        await prisma.service.deleteMany({ where: { barbershopId: shop.id } });
        await prisma.product.deleteMany({ where: { barbershopId: shop.id } });

        await prisma.barbershop.update({
            where: { id: shop.id },
            data: { staff: { set: [] } }
        });

        await prisma.barbershop.delete({ where: { id: shop.id } });
    }

    await prisma.client.deleteMany({ where: { name: { contains: '[DEMO]' } } });

    for (const b of BARBERS) {
        await prisma.user.deleteMany({ where: { email: b.email } });
        await prisma.authUser.deleteMany({ where: { email: b.email } });
    }

    await prisma.user.deleteMany({ where: { email: OWNER_EMAIL } });
    await prisma.authUser.deleteMany({ where: { email: OWNER_EMAIL } });
}

function solveSubsetSum(targetSum, count, availablePrices) {
    for (let attempts = 0; attempts < 20000; attempts++) {
        let currentSum = 0;
        let selected = [];
        for (let i = 0; i < count; i++) {
            const p = availablePrices[Math.floor(Math.random() * availablePrices.length)];
            currentSum += p;
            selected.push(p);
        }
        if (currentSum === targetSum) return selected;
    }
    // Fallback simple
    let selected = [];
    for (let i = 0; i < count; i++) selected.push(40); // Base price
    return selected;
}

async function main() {
    await wipeDemoData();

    console.log('Creating Owner...');
    const authOwner = await prisma.authUser.create({
        data: { email: OWNER_EMAIL, password: 'hashedpassword_demo' }
    });
    const owner = await prisma.user.create({
        data: {
            name: 'Owner Demo',
            email: OWNER_EMAIL,
            authUserId: authOwner.id,
            role: 'ADMIN'
        }
    });

    console.log('Creating Barbershop...');
    const shop = await prisma.barbershop.create({
        data: {
            name: 'Barbearia NEXT',
            slug: DEMO_SLUG,
            ownerId: owner.id,
            saasPlan: 'EMPIRE'
        }
    });

    console.log('Creating Professionals...');
    const createdBarbers = [];
    for (const b of BARBERS) {
        const ab = await prisma.authUser.create({ data: { email: b.email } });
        const user = await prisma.user.create({
            data: {
                name: b.name,
                email: b.email,
                authUserId: ab.id,
                role: 'BARBER',
                workedBarbershopId: shop.id
            }
        });
        createdBarbers.push(user);
        await prisma.barbershop.update({
            where: { id: shop.id },
            data: { staff: { connect: { id: user.id } } }
        });
    }

    console.log('Creating Services...');
    const createdServices = [];
    for (const s of SERVICES_DATA) {
        const srv = await prisma.service.create({
            data: {
                name: s.name,
                price: s.price,
                duration: s.duration,
                barbershopId: shop.id
            }
        });
        createdServices.push(srv);
    }

    console.log('Creating Products...');
    const createdProducts = [];
    for (const p of PRODUCTS_DATA) {
        const prod = await prisma.product.create({
            data: {
                name: p.name,
                price: p.price,
                costPrice: p.costPrice,
                stock: 50,
                barbershopId: shop.id
            }
        });
        createdProducts.push(prod);
    }

    console.log('Creating Clients...');
    const createdClients = [];
    for (let i = 0; i < 150; i++) {
        const cli = await prisma.client.create({
            data: {
                name: `${getRandomName()} [DEMO]`,
                phone: `119${Math.floor(10000000 + Math.random() * 89999999)}`,
            }
        });
        createdClients.push(cli);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // --- TODAY SEED ---
    console.log('Generating Today Appointments (Target: 38 appts, R$ 1280 base revenue)...');
    
    // 09:00 João Silva (Corte) com Marcelo
    // 09:30 Carlos Souza (Corte + Barba) com Rafael
    // 10:00 Pedro Santos (Barba) com Marcelo
    // 10:30 Lucas Oliveira (Corte) com Rafael
    const marcelo = createdBarbers.find(b => b.name === 'Marcelo Maestro');
    const rafael = createdBarbers.find(b => b.name === 'Rafael Costa');
    const srvCorte = createdServices.find(s => s.name === 'Corte Clássico');
    const srvCorteBarba = createdServices.find(s => s.name === 'Corte + Barba');
    const srvBarba = createdServices.find(s => s.name === 'Barba Terapia');

    const hardcodedSlots = [
        { time: '09:00', name: 'João Silva', service: srvCorte, barber: marcelo },
        { time: '09:30', name: 'Carlos Souza', service: srvCorteBarba, barber: rafael },
        { time: '10:00', name: 'Pedro Santos', service: srvBarba, barber: marcelo },
        { time: '10:30', name: 'Lucas Oliveira', service: srvCorte, barber: rafael },
    ];

    let currentSum = 0;
    const TARGET_SUM = 1280;
    const TARGET_COUNT = 38;

    const availableServicePrices = createdServices.map(s => Number(s.price));
    const chosenPrices = solveSubsetSum(TARGET_SUM - hardcodedSlots.reduce((a, b) => a + Number(b.service.price), 0), TARGET_COUNT - hardcodedSlots.length, availableServicePrices);

    let hour = 9;
    let min = 0;

    for (let i = 0; i < TARGET_COUNT; i++) {
        let slotData;
        if (i < hardcodedSlots.length) {
            slotData = hardcodedSlots[i];
            const [h, m] = slotData.time.split(':');
            hour = parseInt(h); min = parseInt(m);
        } else {
            const price = chosenPrices[i - hardcodedSlots.length];
            const srv = createdServices.find(s => Number(s.price) === price) || createdServices[0];
            const barber = createdBarbers[Math.floor(Math.random() * createdBarbers.length)];
            const client = createdClients[i % createdClients.length];
            slotData = { name: client.name, service: srv, barber: barber };
            
            min += 20; 
            if (min >= 60) { min -= 60; hour++; }
            if (hour > 19) hour = 9;
        }

        const date = setMinutes(setHours(today, hour), min);
        const cli = i < hardcodedSlots.length ? await prisma.client.create({ data: { name: slotData.name + ' [DEMO]', phone: `119${Math.floor(10000000 + Math.random() * 89999999)}` } }) : createdClients[i % createdClients.length];

        const appt = await prisma.appointment.create({
            data: {
                date,
                status: 'COMPLETED',
                clientId: cli.id,
                professionalId: slotData.barber.id,
                serviceId: slotData.service.id,
                barbershopId: shop.id,
                paymentStatus: 'PAID'
            }
        });

        // Commission
        const commAmount = Number(slotData.service.price) * 0.5;
        await prisma.commission.create({
            data: {
                barberId: slotData.barber.id,
                barbershopId: shop.id,
                appointmentId: appt.id,
                type: 'SERVICE',
                amount: commAmount,
                percentage: 50,
                status: 'PAID',
                paidAt: date
            }
        });

        await prisma.transaction.create({
            data: {
                description: `Serviço: ${slotData.service.name}`,
                amount: slotData.service.price,
                type: 'INCOME',
                date,
                barbershopId: shop.id,
                appointmentId: appt.id,
                professionalId: slotData.barber.id
            }
        });
    }

    // --- HISTORICAL DATA (30 DAYS) ---
    console.log('Generating 30 days of historical data...');
    for (let d = 30; d >= 1; d--) {
        const curDate = subDays(today, d);
        const factor = 1 + ((30 - d) / 30) * 0.4; // Growth curve
        const count = Math.floor((15 + Math.random() * 15) * factor);

        for (let i = 0; i < count; i++) {
            const srv = createdServices[Math.floor(Math.random() * createdServices.length)];
            const barber = createdBarbers[Math.floor(Math.random() * createdBarbers.length)];
            const client = createdClients[Math.floor(Math.random() * (createdClients.length / 2))]; // Heavy reuse for first half to show retention
            
            const appointmentDate = setMinutes(setHours(curDate, 9 + Math.floor(i / 2)), (i % 2) * 30);
            
            const appt = await prisma.appointment.create({
                data: {
                    date: appointmentDate,
                    status: 'COMPLETED',
                    clientId: client.id,
                    professionalId: barber.id,
                    serviceId: srv.id,
                    barbershopId: shop.id,
                    paymentStatus: 'PAID'
                }
            });

            // Service Commission
            await prisma.commission.create({
                data: {
                    barberId: barber.id,
                    barbershopId: shop.id,
                    appointmentId: appt.id,
                    type: 'SERVICE',
                    amount: Number(srv.price) * 0.5,
                    percentage: 50,
                    status: 'PAID',
                    paidAt: appointmentDate
                }
            });

            // Income
            await prisma.transaction.create({
                data: {
                    description: `Serviço: ${srv.name}`,
                    amount: srv.price,
                    type: 'INCOME',
                    date: appointmentDate,
                    barbershopId: shop.id,
                    appointmentId: appt.id,
                    professionalId: barber.id
                }
            });

            // Upsell Product? (20% chance)
            if (Math.random() < 0.2) {
                const prod = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                await prisma.transaction.create({
                    data: {
                        description: `Venda Produto: ${prod.name}`,
                        amount: prod.price,
                        type: 'INCOME',
                        date: appointmentDate,
                        barbershopId: shop.id,
                        professionalId: barber.id
                    }
                });
                
                // Product commission (10%)
                await prisma.commission.create({
                    data: {
                        barberId: barber.id,
                        barbershopId: shop.id,
                        type: 'PRODUCT',
                        amount: Number(prod.price) * 0.1,
                        percentage: 10,
                        status: 'PAID',
                        paidAt: appointmentDate
                    }
                });
            }
        }

        // Daily Expenses
        await prisma.transaction.create({
            data: {
                description: 'Despesas Fixas e Manutenção',
                amount: 150 + Math.random() * 100,
                type: 'EXPENSE',
                category: 'Manutenção',
                date: curDate,
                barbershopId: shop.id
            }
        });
    }

    // --- FUTURE DATA (7 DAYS) ---
    console.log('Generating 7 days of future appointments...');
    for (let d = 1; d <= 7; d++) {
        const futDate = addDays(today, d);
        const count = Math.floor(10 + Math.random() * 10); // ~50% occupancy

        for (let i = 0; i < count; i++) {
            const srv = createdServices[Math.floor(Math.random() * createdServices.length)];
            const barber = createdBarbers[Math.floor(Math.random() * createdBarbers.length)];
            const client = createdClients[Math.floor(Math.random() * createdClients.length)];
            const appointmentDate = setMinutes(setHours(futDate, 9 + i), 0);

            await prisma.appointment.create({
                data: {
                    date: appointmentDate,
                    status: 'CONFIRMED',
                    clientId: client.id,
                    professionalId: barber.id,
                    serviceId: srv.id,
                    barbershopId: shop.id,
                    paymentStatus: 'PENDING'
                }
            });
        }
    }

    console.log('Seed completed successfully for Marketing Mocks!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
