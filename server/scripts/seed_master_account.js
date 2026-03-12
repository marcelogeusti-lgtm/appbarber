const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addDays, subDays, setHours, setMinutes } = require('date-fns');

const MASTER_SLUG = 'next';
const DEMO_SLUG = 'next-demo-marketing';
const DEMO_OWNER_EMAIL = 'demo@corteconexao.com.br';

const FIRST_NAMES = ["João", "Carlos", "Pedro", "Lucas", "Mateus", "Rafael", "Felipe", "André", "Marcos", "Thiago", "Bruno", "Caio", "Diego", "Enzo", "Gabriel", "Henrique", "Igor", "Julio", "Leonardo", "Marcelo", "Natan", "Otávio", "Paulo", "Ricardo", "Samuel", "Tiago", "Vinicius", "William", "Yuri", "Zeca"];
const LAST_NAMES = ["Silva", "Souza", "Santos", "Oliveira", "Pereira", "Lima", "Carvalho", "Ferreira", "Costa", "Gomes", "Martins", "Araujo", "Melo", "Barbosa", "Ribeiro", "Alves", "Rocha", "Nunes", "Mendes", "Vieira"];

function getRandomName() {
    return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
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
    let selected = [];
    for (let i = 0; i < count; i++) selected.push(availablePrices[0] || 40);
    return selected;
}

async function wipeDemoData() {
    console.log('Cleaning up demo account/data...');
    const demoShop = await prisma.barbershop.findUnique({ where: { slug: DEMO_SLUG } });
    if (demoShop) {
        // Cascade manually for records that might block deletion
        await prisma.gatewayConfig.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.review.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.auditLog.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.featureFlag.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.orderItem.deleteMany({ where: { order: { barbershopId: demoShop.id } } });
        await prisma.order.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.transaction.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.appointment.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.commission.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.waitlist.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.noShowRecord.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.webhook.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.service.deleteMany({ where: { barbershopId: demoShop.id } });
        await prisma.product.deleteMany({ where: { barbershopId: demoShop.id } });
        
        // Unlink staff
        await prisma.user.updateMany({
            where: { workedBarbershopId: demoShop.id },
            data: { workedBarbershopId: null }
        });

        await prisma.barbershop.delete({ where: { id: demoShop.id } });
    }
    await prisma.user.deleteMany({ where: { email: DEMO_OWNER_EMAIL } });
    await prisma.authUser.deleteMany({ where: { email: DEMO_OWNER_EMAIL } });
    await prisma.client.deleteMany({ where: { name: { contains: '[DEMO]' } } });
}

async function main() {
    await wipeDemoData();

    console.log(`Locating Master Barbershop: ${MASTER_SLUG}...`);
    const shop = await prisma.barbershop.findUnique({
        where: { slug: MASTER_SLUG },
        include: {
            staff: true,
            services: true
        }
    });

    if (!shop) {
        console.error('Master Barbershop not found!');
        return;
    }

    const marcelo = shop.staff.find(s => s.name.includes('Marcelo')) || shop.staff[0];
    const rafael = shop.staff.find(s => s.name.includes('Rafael')) || shop.staff[1] || marcelo;
    
    // Services lookup
    const srvCorte = shop.services.find(s => s.name.toLowerCase().includes('corte')) || shop.services[0];
    const srvBarba = shop.services.find(s => s.name.toLowerCase().includes('barba')) || shop.services[0];
    const srvCombo = shop.services.find(s => s.name.toLowerCase().includes('+')) || srvCorte;

    console.log('Creating 150 unique demo clients for NextApp...');
    const createdClients = [];
    for (let i = 0; i < 150; i++) {
        const cli = await prisma.client.create({
            data: {
                name: getRandomName(),
                phone: `119${Math.floor(10000000 + Math.random() * 89999999)}`,
            }
        });
        createdClients.push(cli);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // --- TODAY SEED ---
    console.log('Generating Today Appointments (Target: 38 appts, R$ 1280 revenue)...');
    
    // Hardcoded morning slots for screenshots
    const hardcodedSlots = [
        { time: '09:00', name: 'João Silva', service: srvCorte, barber: marcelo },
        { time: '09:30', name: 'Carlos Souza', service: srvCombo, barber: rafael },
        { time: '10:00', name: 'Pedro Santos', service: srvBarba, barber: marcelo },
        { time: '10:30', name: 'Lucas Oliveira', service: srvCorte, barber: rafael },
    ];

    const TARGET_SUM = 1280;
    const TARGET_COUNT = 38;
    const availablePrices = shop.services.map(s => Number(s.price));
    
    const hardcodedSum = hardcodedSlots.reduce((a, b) => a + Number(b.service.price), 0);
    const chosenPrices = solveSubsetSum(TARGET_SUM - hardcodedSum, TARGET_COUNT - hardcodedSlots.length, availablePrices);

    let h = 9, m = 0;
    for (let i = 0; i < TARGET_COUNT; i++) {
        let slotData;
        if (i < hardcodedSlots.length) {
            slotData = hardcodedSlots[i];
            const [sh, sm] = slotData.time.split(':');
            h = parseInt(sh); m = parseInt(sm);
        } else {
            const price = chosenPrices[i - hardcodedSlots.length];
            const srv = shop.services.find(s => Number(s.price) === price) || srvCorte;
            const barber = marcelo;
            const client = createdClients[i % createdClients.length];
            slotData = { name: client.name, service: srv, barber: barber };
            
            m += 15;
            if (m >= 60) { m -= 60; h++; }
            if (h > 19) h = 9;
        }

        const date = setMinutes(setHours(today, h), m);
        const cli = i < hardcodedSlots.length ? await prisma.client.create({ data: { name: slotData.name, phone: `119${Math.floor(10000000 + Math.random() * 89999999)}` } }) : createdClients[i % createdClients.length];

        const appt = await prisma.appointment.create({
            data: {
                date,
                status: 'COMPLETED',
                clientId: cli.id,
                professionalId: slotData.barber.id,
                serviceId: slotData.service.id,
                barbershopId: shop.id,
                paymentStatus: 'PAID',
                paymentMethod: 'PIX'
            }
        });

        await prisma.commission.create({
            data: {
                barberId: slotData.barber.id,
                barbershopId: shop.id,
                appointmentId: appt.id,
                type: 'SERVICE',
                amount: Number(slotData.service.price) * 0.5,
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
                professionalId: slotData.barber.id,
                paymentMethod: 'PIX'
            }
        });
    }

    // --- HISTORICAL DATA (30 DAYS) ---
    console.log('Generating 30 days of historical data for NextApp...');
    for (let d = 30; d >= 1; d--) {
        const curDate = subDays(today, d);
        const count = Math.floor(20 + Math.random() * 10);

        for (let i = 0; i < count; i++) {
            const srv = shop.services[Math.floor(Math.random() * shop.services.length)];
            const barber = marcelo;
            const client = createdClients[Math.floor(Math.random() * createdClients.length)];
            const apptDate = setMinutes(setHours(curDate, 9 + Math.floor(i/2)), (i%2)*30);

            const appt = await prisma.appointment.create({
                data: {
                    date: apptDate,
                    status: 'COMPLETED',
                    clientId: client.id,
                    professionalId: barber.id,
                    serviceId: srv.id,
                    barbershopId: shop.id,
                    paymentStatus: 'PAID'
                }
            });

            await prisma.commission.create({
                data: {
                    barberId: barber.id,
                    barbershopId: shop.id,
                    appointmentId: appt.id,
                    type: 'SERVICE',
                    amount: Number(srv.price) * 0.5,
                    percentage: 50,
                    status: 'PAID',
                    paidAt: apptDate
                }
            });

            await prisma.transaction.create({
                data: {
                    description: `Serviço: ${srv.name}`,
                    amount: srv.price,
                    type: 'INCOME',
                    date: apptDate,
                    barbershopId: shop.id,
                    appointmentId: appt.id,
                    professionalId: barber.id
                }
            });
        }
    }

    console.log('Seed completed for Master Account!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
