require('dotenv').config({ path: 'server/.env' });
if (process.env.DIRECT_URL) {
    process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const { createAppointment } = require('../src/controllers/appointment.controller');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function run() {
    try {
        console.log('Connecting DB...');
        await prisma.$connect();

        const barbershop = await prisma.barbershop.findFirst();
        console.log('Barbershop:', barbershop?.id);

        const service = await prisma.service.findFirst({ where: { barbershopId: barbershop.id } });
        console.log('Service:', service?.id);

        let pro = await prisma.user.findFirst({ where: { role: 'BARBER', workedBarbershopId: barbershop.id } });
        if (!pro) {
            console.log('No BARBER found, trying any user linked...');
            pro = await prisma.user.findFirst({ where: { workedBarbershopId: barbershop.id } });
        }
        if (!pro) {
            console.log('No staff found, trying owner...');
            pro = await prisma.user.findUnique({ where: { id: barbershop.ownerId } });
        }
        console.log('Pro:', pro?.id);

        if (!service || !pro) {
            console.error('Missing service/pro to test');
            return;
        }

        const date = new Date();
        date.setDate(date.getDate() + 1);
        const nextDate = date.toISOString().split('T')[0];

        const req = {
            body: {
                cliente_nome: 'Test Repro',
                cliente_telefone: '11999999999',
                barbearia_id: barbershop.id,
                barbeiro_id: pro.id,
                servicos: [{ servico_id: service.id }],
                data: nextDate,
                horario: '10:00',
                forma_pagamento: 'PIX',
            },
            // user: { id: 'mock-user-id' } // Removed to simulate guest and let controller create client
        };

        const res = {
            status: (code) => ({
                json: (data) => {
                    console.log(`Response ${code}:`, JSON.stringify(data, null, 2));
                    if (code >= 500) {
                        const errData = JSON.stringify(data, null, 2);
                        console.log('WRITING ERROR LOG...');
                        fs.writeFileSync('error.log', errData);
                    }
                }
            }),
            json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2))
        };

        console.log('Calling createAppointment...');
        await createAppointment(req, res);

    } catch (e) {
        console.error('Script Error:', e);
        fs.writeFileSync('error.log', e.toString() + '\\n' + (e.stack || ''));
    } finally {
        await prisma.$disconnect();
    }
}

run();
