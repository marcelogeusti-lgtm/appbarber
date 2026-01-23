const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'marcelogeusti@gmail.com',
            password: 'wrong_password_test'
        });
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Network/Request Error:', error.message);
        }
    }
}

testLogin();
