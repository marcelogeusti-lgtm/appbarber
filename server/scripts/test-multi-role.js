const axios = require('axios');

async function testAuth() {
    const API_URL = 'https://barber-api-uz05.onrender.com/api';
    const testEmail = 'test_multi_role_' + Date.now() + '@example.com';

    try {
        console.log('--- Testing PRO Context ---');
        const proRes = await axios.post(`${API_URL}/auth/social-login`, {
            email: testEmail,
            name: 'Test Barber',
            provider: 'GOOGLE',
            providerId: 'google-123',
            context: 'PRO'
        });
        console.log('PRO User Object:', JSON.stringify(proRes.data.user, null, 2));
        console.log('PRO Success:', proRes.data.user.role === 'ADMIN' ? '✅' : '❌');
        console.log('Barbershop Created:', proRes.data.barbershopId ? '✅' : '❌');

        console.log('\n--- Testing CLIENT Context ---');
        const clientRes = await axios.post(`${API_URL}/auth/social-login`, {
            email: testEmail,
            name: 'Test Client',
            provider: 'GOOGLE',
            providerId: 'google-123',
            context: 'CLIENT'
        });
        console.log('CLIENT Success:', clientRes.data.user.role === 'CLIENT' ? '✅' : '❌');

        console.log('\n--- Final Summary ---');
        if (proRes.data.user.role === 'ADMIN' && clientRes.data.user.role === 'CLIENT') {
            console.log('Multi-role authentication is working perfectly!');
        } else {
            console.log('There are issues with role distinction.');
        }

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

testAuth();
