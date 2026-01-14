const { createAppointment } = require('../controllers/appointment.controller');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock Req/Res
const mockRes = {
    status: function (code) {
        this.statusCode = code;
        console.log(`[Response Status]: ${code}`);
        return this;
    },
    json: function (data) {
        console.log('[Response Body]:', JSON.stringify(data, null, 2));
        return this;
    }
};

async function test() {
    try {
        console.log('--- Setup Data ---');
        // IDs capturados do debugData.js
        const serviceId = 'aabfdeef-cc8b-4d91-9fc4-2d5aa802d511'; // Barba + Tinta (ACTIVE)
        const barberId = '6b3f101e-2c91-4310-b051-c06ae9cf50a1'; // Marcelo Geusti (BARBER)

        console.log(`Using Service: ${serviceId}`);
        console.log(`Using Barber: ${barberId}`);

        // 2. Prepare Payload
        // Date must be a working day (check log or assume a weekday)
        // Let's try next Monday to be safe about work hours
        const payload = {
            cliente_nome: "Debug Consumer",
            cliente_telefone: "11999999999",
            barbeiro_id: barberId,
            servicos: [{ servico_id: serviceId }],
            // Future date logic: 
            data: "2026-05-25", // A Monday
            horario: "10:00",
            forma_pagamento: "local",
            produtos: []
        };

        const req = {
            body: payload,
            user: null, // Guest
            headers: {}
        };

        console.log('\n--- Executing createAppointment ---');
        await createAppointment(req, mockRes);

    } catch (e) {
        console.error('Test Script Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
