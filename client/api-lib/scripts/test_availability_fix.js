const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const availability = require('../controllers/availability.controller');

async function testController() {
    const req = {
        params: {
            barbershopId: '94dad01c-504e-4f93-bcfe-5371d5a7ee50',
            date: new Date().toISOString().split('T')[0]
        },
        query: {
            serviceIds: '9133bd8c-572e-4b68-9128-40bba0567e9f' // Assuming this is a valid service ID
        }
    };

    const res = {
        json: (data) => console.log('RESPONSE:', JSON.stringify(data, null, 2)),
        status: (code) => ({ json: (data) => console.log('STATUS', code, 'ERROR:', data) })
    };

    console.log('--- TESTING AVAILABILITY CONTROLLER ---');
    try {
        await availability.getAvailableSlots(req, res);
    } catch (e) {
        console.error('CRASHED:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testController();
