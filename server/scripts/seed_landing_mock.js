const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { randomUUID } = require('crypto');

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

        // Unlink staff
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
    for (let attempts = 0; attempts < 10000; attempts++) {
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
    for (let i = 0; i < count; i++) selected.push(availablePrices[0]);
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

    console.log('Creating Clients...');
    const createdClientsData = [];
    for (let i = 0; i < 150; i++) {
        createdClientsData.push({
            id: randomUUID(),
            name: `${getRandomName()} [DEMO]`,
            phone: `119${Math.floor(10000000 + Math.random() * 89999999)}`,
        });
    }
    await prisma.client.createMany({ data: createdClientsData });
    const createdClients = await prisma.client.findMany({ where: { name: { contains: '[DEMO]' } } });

    console.log('Generating Hardcoded Today Appointments...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const marcelo = createdBarbers.find(b => b.name === 'Marcelo Maestro');
    const rafael = createdBarbers.find(b => b.name === 'Rafael Costa');

    const srvCorte = createdServices.find(s => s.name === 'Corte Clássico');
    const srvCorteBarba = createdServices.find(s => s.name === 'Corte + Barba');
    const srvBarba = createdServices.find(s => s.name === 'Barba Terapia');

    const hardcodedSlots = [
        { time: '09:00', clientName: 'João Silva', service: srvCorte, barber: marcelo },
        { time: '09:30', clientName: 'Carlos Souza', service: srvCorteBarba, barber: rafael },
        { time: '10:00', clientName: 'Pedro Santos', service: srvBarba, barber: marcelo },
        { time: '10:30', clientName: 'Lucas Oliveira', service: srvCorte, barber: rafael },
    ];

    let hardcodedSum = 0;
    for (const slot of hardcodedSlots) {
        const date = new Date(today);
        const [h, m] = slot.time.split(':');
        date.setHours(parseInt(h), parseInt(m), 0, 0);

        const cli = await prisma.client.create({ data: { name: slot.clientName + ' [DEMO]', phone: `119${Math.floor(10000000 + Math.random() * 89999999)}` } });

        const appt = await prisma.appointment.create({
            data: {
                date,
                status: 'COMPLETED',
                clientId: cli.id,
                professionalId: slot.barber.id,
                serviceId: slot.service.id,
                barbershopId: shop.id,
                paymentStatus: 'PAID'
            }
        });

        await prisma.transaction.create({
            data: {
                description: `Atendimento - ${slot.service.name}`,
                amount: slot.service.price,
                type: 'INCOME',
                date,
                barbershopId: shop.id,
                appointmentId: appt.id
            }
        });

        hardcodedSum += Number(slot.service.price);
    }

    console.log(`Hardcoded Sum: R$ ${hardcodedSum}`);

    const TARGET_TODAY_SUM = 1280;
    const TARGET_TODAY_COUNT = 38;
    const remainingCount = TARGET_TODAY_COUNT - hardcodedSlots.length;
    const remainingSum = TARGET_TODAY_SUM - hardcodedSum;

    console.log(`Generating remaining ${remainingCount} appointments to reach R$ ${remainingSum}...`);

    const availablePrices = createdServices.map(s => Number(s.price));
    const chosenPrices = solveSubsetSum(remainingSum, remainingCount, availablePrices);

    const finalSum = chosenPrices.reduce((a, b) => a + b, 0);
    console.log(`Matched subset sum for today: ${finalSum} (Diff: ${remainingSum - finalSum})`);

    let hour = 11;
    let min = 0;

    const todayApptsData = [];
    const todayTxnsData = [];

    for (let i = 0; i < remainingCount; i++) {
        const price = chosenPrices[i];
        const srv = createdServices.find(s => Number(s.price) === price) || createdServices[0];
        const barber = createdBarbers[Math.floor(Math.random() * createdBarbers.length)];
        const client = createdClients[Math.floor(Math.random() * createdClients.length)];

        const date = new Date(today);
        date.setHours(hour, min, 0, 0);

        min += 30;
        if (min >= 60) {
            min -= 60;
            hour++;
        }

        const apptId = randomUUID();
        todayApptsData.push({
            id: apptId,
            date,
            status: 'COMPLETED',
            clientId: client.id,
            professionalId: barber.id,
            serviceId: srv.id,
            barbershopId: shop.id,
            paymentStatus: 'PAID'
        });

        todayTxnsData.push({
            id: randomUUID(),
            description: `Atendimento - ${srv.name}`,
            amount: i === remainingCount - 1 && finalSum !== remainingSum ? (price + (remainingSum - finalSum)) : price,
            type: 'INCOME',
            date,
            barbershopId: shop.id,
            appointmentId: apptId
        });
    }

    await prisma.appointment.createMany({ data: todayApptsData });
    await prisma.transaction.createMany({ data: todayTxnsData });

    console.log('Generating Historic Data (Last 4 Weeks)...');

    const historyApptsData = [];
    const historyTxnsData = [];

    const daysAgoStart = 28;
    for (let d = daysAgoStart; d >= 1; d--) {
        const curDate = new Date(today);
        curDate.setDate(curDate.getDate() - d);

        const factor = 1 + ((28 - d) / 28) * 0.3;

        let numApps = Math.floor((15 + Math.random() * 10) * factor);
        if (d <= 7) numApps = Math.floor(30 + Math.random() * 8);

        let dailyRevenue = 0;

        for (let i = 0; i < numApps; i++) {
            const srv = createdServices[Math.floor(Math.random() * createdServices.length)];
            const barber = createdBarbers[Math.floor(Math.random() * createdBarbers.length)];
            const client = createdClients[Math.floor(Math.random() * createdClients.length)];

            const date = new Date(curDate);
            date.setHours(9 + Math.floor(i / 3), (i % 3) * 20, 0, 0);

            const apptId = randomUUID();

            historyApptsData.push({
                id: apptId,
                date,
                status: 'COMPLETED',
                clientId: client.id,
                professionalId: barber.id,
                serviceId: srv.id,
                barbershopId: shop.id,
                paymentStatus: 'PAID'
            });

            historyTxnsData.push({
                id: randomUUID(),
                description: `Atendimento - ${srv.name}`,
                amount: srv.price,
                type: 'INCOME',
                date,
                barbershopId: shop.id,
                appointmentId: apptId
            });

            dailyRevenue += Number(srv.price);
        }

        const expenseTotal = dailyRevenue * 0.47 * (0.9 + Math.random() * 0.2);

        historyTxnsData.push({
            id: randomUUID(),
            description: 'Despesas Operacionais e Comissões',
            amount: expenseTotal,
            type: 'EXPENSE',
            category: 'Geral',
            date: curDate,
            barbershopId: shop.id
        });
    }

    console.log(`Bulk inserting ${historyApptsData.length} appointments and ${historyTxnsData.length} transactions...`);

    await prisma.appointment.createMany({ data: historyApptsData });
    await prisma.transaction.createMany({ data: historyTxnsData });

    console.log('Seed completed successfully for Landing Page Mocks!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
