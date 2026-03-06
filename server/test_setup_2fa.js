const jwt = require('jsonwebtoken');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

async function run() {
    const user = await prisma.authUser.findUnique({
        where: { email: 'marcelogeusti@gmail.com' }
    });

    if (!user) {
        console.log('User not found in DB');
        return;
    }

    const token = jwt.sign(
        { authUserId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    const data = JSON.stringify({
        method: 'EMAIL'
    });

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/2fa/setup-request',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, res => {
        console.log(`[TEST SETUP] status: ${res.statusCode}`);
        res.on('data', d => process.stdout.write(d));
    });

    req.on('error', error => console.error(error));
    req.write(data);
    req.end();
}

run().finally(() => prisma.$disconnect());
