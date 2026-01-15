const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testAuth() {
    console.log('--- Testing Auth Flow ---');
    const email = `test_client_${Date.now()}@test.com`;
    const password = 'password123';

    // 1. Register
    try {
        console.log(`Registering ${email}...`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Test Client',
            email,
            password,
            phone: '11999998888',
            role: 'CLIENT'
        });
        console.log('Register Success:', regRes.data.token ? 'Yes' : 'No');

        const token = regRes.data.token;

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        console.log('Login Success. Role:', loginRes.data.user.role);

        if (loginRes.data.user.role !== 'CLIENT') throw new Error('Role mismatch');

        // 3. Login as Pro (Should Fail)
        console.log('Attempting Pro Context Login...');
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email, password, context: 'PRO'
            });
            console.error('FAIL: Pro login should have failed.');
        } catch (e) {
            console.log('Success: Pro login blocked with', e.response?.status);
        }

    } catch (e) {
        console.error('Test Failed:', e.message, e.response?.data);
    }
}

testAuth();
