const jwt = require('jsonwebtoken');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testMeEndpoint() {
    try {
        const client = await prisma.client.findFirst({
            where: { authUser: { email: 'cgeusti@gmail.com' } },
            include: { authUser: true }
        });

        if (!client) {
            console.log("Client not found!");
            return;
        }

        console.log(`Generating token for Client ID: ${client.id}`);

        const token = jwt.sign(
            { id: client.id, role: 'CLIENT', authUserId: client.authUser?.id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '30d' }
        );

        console.log("Token:", token);

        console.log("Making request to http://localhost:3001/api/appointments/me...");
        const response = await axios.get('http://localhost:3001/api/appointments/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Status:", response.status);
        console.log("Data:", response.data);
    } catch (e) {
        if (e.response) {
            console.error("API Error:", e.response.status, e.response.data);
        } else {
            console.error("Error:", e.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

testMeEndpoint();
