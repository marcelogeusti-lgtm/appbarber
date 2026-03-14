const { getAllAppointments } = require('../controllers/appointment.controller');
const prisma = require('../lib/prisma');

async function test() {
    const req = {
        query: {
            barbershopId: '94dad01c-504e-4f93-bcfe-5371d5a7ee50',
            start: '2026-03-01T00:00:00.000Z',
            end: '2026-03-31T23:59:59.999Z',
            limit: '1000'
        },
        user: {
            id: 'ff550352-540a-4fd4-a1a5-55cb7c61a54f', // Marcelo Geusti
            role: 'SUPER_ADMIN'
        }
    };

    const res = {
        json: (data) => {
            console.log('--- API RESPONSE ---');
            console.log(`Count: ${data.data?.length}`);
            if (data.data?.length > 0) {
                const pros = new Set(data.data.map(a => a.professionalId));
                console.log('Professional IDs found in Appointments:', Array.from(pros));
            }
            process.exit(0);
        },
        status: (code) => ({ json: (data) => process.exit(1) })
    };

    try {
        await getAllAppointments(req, res);
    } catch (err) {
        process.exit(1);
    }
}
test();
