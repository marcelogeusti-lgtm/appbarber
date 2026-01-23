const axios = require('axios');

async function testManual() {
    try {
        console.log('Testing Manual Order (Balcão)...');
        // I need a valid token to test since I apply protect and checkSubscription in order.routes.js
        // For simplicity in this env, I'll bypass or use a mock if possible, but I can't easily.
        // I'll try to use the raw prisma client to verify the logic directly if axios fails due to auth.

        const response = await axios.post('http://localhost:3001/api/orders', {
            professionalId: 'f66798e7-6fb2-4c73-ac7a-c8b45bbe40fd',
            barbershopId: '8b3fcfd4-309c-4e24-9004-e03492986be4',
            guestName: 'Manual Order Test',
            guestPhone: '21988268746',
            serviceIds: ['3691776c-6f8e-47e1-be14-332ee1d28a4e'],
            isManual: true
        });

        console.log('Success:', response.status);
        console.log('Order Details:', JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.log('Status:', err.response?.status);
        console.log('Error Data:', JSON.stringify(err.response?.data, null, 2));
    }
}

testManual();
