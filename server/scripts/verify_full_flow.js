const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Localhost URL - ensure server is running or use a known internal URL if deploying
const BASE_URL = 'http://localhost:3001/api';

async function verifyFlow() {
    const email = `test-robust-${Date.now()}@test.com`;
    const password = 'password123';
    const barbershopName = `Robust Barbershop ${Date.now()}`;

    console.log(`Starting Robust Verification for ${email}...`);

    try {
        // 1. REGISTER
        console.log('[1] Registering...');
        // We need to simulate the request to the controller function if server not running, 
        // BUT best is to test the actual controller logic.
        // Since we cannot easily curl localhost if it's not running in this environment (Request blocked?), 
        // we will simulate the Controller Call by importing it OR using prisma directly to simulate state.
        // Actually, let's use the actual controller functions by importing them!

        // MOCK REQ/RES
        const mockRes = () => {
            const res = {};
            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => { res.data = data; return res; };
            return res;
        };

        const authController = require('../src/controllers/auth.controller');

        const reqReg = {
            body: {
                name: 'Robust Tester',
                email,
                password,
                role: 'ADMIN',
                barbershopName,
                phone: '11999999999'
            }
        };
        const resReg = mockRes();

        await authController.register(reqReg, resReg);

        if (resReg.statusCode !== 201) {
            throw new Error(`Registration failed: ${resReg.statusCode} ${JSON.stringify(resReg.data)}`);
        }

        console.log('[SUCCESS] Registration successful.');
        const user = resReg.data.user;
        const token = resReg.data.token;

        // CHECK: Does user have ownedBarbershops?
        if (!user.ownedBarbershops || user.ownedBarbershops.length === 0) {
            console.error('[FAIL] User object missing ownedBarbershops!');
        } else {
            console.log('[PASS] User object has ownedBarbershops.');
        }

        // 2. CHECK MIDDLEWARE ACCESS (Simulated)
        console.log('[2] Checking Middleware Access...');
        const subMiddleware = require('../src/middlewares/subscription.middleware');

        const reqMid = {
            user: {
                ...user,
                barbershopId: user.ownedBarbershops[0].id
            }
        };
        const resMid = mockRes();
        const next = () => { console.log('[PASS] Middleware allowed access (next called).'); };

        await subMiddleware.checkSubscription(reqMid, resMid, next);

        if (resMid.statusCode && resMid.statusCode !== 200) {
            console.error(`[FAIL] Middleware blocked access: ${resMid.statusCode} ${JSON.stringify(resMid.data)}`);
        }

        // CLEANUP
        console.log('Cleaning up...');
        await prisma.barbershop.delete({ where: { id: user.ownedBarbershops[0].id } });
        await prisma.user.delete({ where: { id: user.id } });
        await prisma.authUser.delete({ where: { email } });

    } catch (error) {
        console.error('Verification FAILED:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyFlow();
