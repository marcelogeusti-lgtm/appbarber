const axios = require('axios');

async function test() {
    try {
        console.log('Testing Multi-Service Appointment...');
        const response = await axios.post('http://localhost:3001/api/appointments', {
            professionalId: 'f66798e7-6fb2-4c73-ac7a-c8b45bbe40fd',
            // Using the same service twice or finding another one
            servicos: [
                { servico_id: '3691776c-6f8e-47e1-be14-332ee1d28a4e' }
            ],
            barbershopId: '8b3fcfd4-309c-4e24-9004-e03492986be4',
            data: '2026-01-23',
            horario: '21:00',
            cliente_nome: 'Multi Test',
            cliente_telefone: '21988268746',
            forma_pagamento: 'local'
        });
        console.log('Success:', response.status, response.data.appointment_id);
    } catch (err) {
        console.log('Status:', err.response?.status);
        console.log('Error Data:', JSON.stringify(err.response?.data, null, 2));
    }
}

test();
