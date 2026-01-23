const axios = require('axios');

async function test() {
    try {
        const response = await axios.post('http://localhost:3001/api/appointments', {
            professionalId: 'f66798e7-6fb2-4c73-ac7a-c8b45bbe40fd',
            serviceId: '3691776c-6fa4-4a4e-47e1-be14-332ee1d28a',
            barbershopId: '8b3fcfd4-309c-4e24-9004-e03492986be4',
            date: '2026-01-23',
            time: '20:00', // Use a future time
            guestName: 'Bruno Test',
            guestPhone: '21988268746'
        });
        console.log('Success:', response.status, response.data);
    } catch (err) {
        console.log('Status:', err.response?.status);
        console.log('Error Data:', JSON.stringify(err.response?.data, null, 2));
    }
}

test();
