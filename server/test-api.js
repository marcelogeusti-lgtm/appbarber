const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './.env' }); // Ensure it reads server/.env

const clientToken = jwt.sign(
    { id: '9e464e88-b1d5-4bad-8a4c-793838904ead', role: 'CLIENT', authUserId: 'some-auth-id' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
);

const payload = {
    name: 'Marcelo Geusti',
    phone: '21991164174',
    gender: 'Masculino',
    birthDate: ''
};

console.log("Using token:", clientToken.substring(0, 30) + '...');
console.log("Payload:", payload);

fetch('http://localhost:3001/api/clients/profile', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`
    },
    body: JSON.stringify(payload)
})
    .then(res => {
        console.log("Status:", res.status);
        return res.text();
    })
    .then(data => console.log('API RESPONSE:', data))
    .catch(err => console.error('Fetch Error:', err));
