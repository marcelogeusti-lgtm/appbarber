const prisma = require('./server/src/lib/prisma');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './server/.env' });

async function run() {
    try {
        const appointment = await prisma.appointment.findFirst({
            where: { status: 'COMPLETED', review: null },
            include: { client: true }
        });
        
        if (!appointment) {
            console.log('No unreviewed appointment found.');
            return;
        }
        
        console.log('Testing with appointment:', appointment.id, 'client:', appointment.clientId);
        
        const req = {
            body: { appointmentId: appointment.id, rating: 5, comment: 'Muito bom!' },
            user: { id: appointment.clientId, role: 'CLIENT' }
        };
        
        const res = {
            status: (code) => ({
                json: (data) => console.log('Response:', code, data)
            }),
            json: (data) => console.log('Response: 201', data)
        };
        
        const controller = require('./server/src/controllers/review.controller');
        await controller.createReview(req, res);
        
    } catch (e) {
        console.error(e);
    }
}
run();
