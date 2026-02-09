const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Localhost URL - ensure server is running or use a known internal URL if deploying
const BASE_URL = 'http://localhost:3001/api';

async function verifyFlow() {
    const email = `test-robust-${Date.now()}@test.com`;
    const password = 'password123';
    const barbershopName = `Robust Barbershop ${Date.now()}`;

    const fs = require('fs');
    const logFile = 'verification.log';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };
    const errorLog = (msg) => {
        console.error(msg);
        fs.appendFileSync(logFile, 'ERROR: ' + msg + '\n');
    };

    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

    log(`Starting Robust Verification for ${email}...`);

    try {
        // 1. REGISTER
        log('[1] Registering...');
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

        log('[SUCCESS] Registration successful.');
        const user = resReg.data.user;
        const token = resReg.data.token;

        // CHECK: Does user have ownedBarbershops?
        if (!user.ownedBarbershops || user.ownedBarbershops.length === 0) {
            errorLog('[FAIL] User object missing ownedBarbershops!');
        } else {
            log('[PASS] User object has ownedBarbershops.');
        }

        // 2. CHECK MIDDLEWARE ACCESS (Simulated)
        log('[2] Checking Middleware Access...');
        const subMiddleware = require('../src/middlewares/subscription.middleware');

        const reqMid = {
            user: {
                ...user,
                barbershopId: user.ownedBarbershops[0].id
            }
        };
        const resMid = mockRes();
        const next = () => { log('[PASS] Middleware allowed access (next called).'); };

        await subMiddleware.checkSubscription(reqMid, resMid, next);

        if (resMid.statusCode && resMid.statusCode !== 200) {
            errorLog(`[FAIL] Middleware blocked access: ${resMid.statusCode} ${JSON.stringify(resMid.data)}`);
        }

        // 2.5 CREATE MOCK DATA
        log('[2.5] Creating Mock Data...');
        const service = await prisma.service.create({ data: { name: 'Corte Teste', price: 50.00, duration: 30, barbershopId: user.ownedBarbershops[0].id } });
        const client = await prisma.client.create({ data: { name: 'Cliente Teste', phone: '11988888888' } });
        await prisma.professional.create({ data: { userId: user.id } }).catch(() => { });
        const appointment = await prisma.appointment.create({ data: { date: new Date(), status: 'PENDING', serviceId: service.id, professionalId: user.id, clientId: client.id, barbershopId: user.ownedBarbershops[0].id } });


        // 3. CHECK PAYMENT CREATION (Mercado Pago Mock)
        log('[3] Checking Payment Creation (Mocked)...');
        // Skipped for now during cleanup, or we can add MP specific test later.
        log('[SKIP] Velfy Payment Test Removed.');

        // CLEANUP
        log('Cleaning up...');
        // Delete dependent records first
        await prisma.payment.deleteMany({ where: { barbershopId: user.ownedBarbershops[0].id } });
        await prisma.gatewayConfig.deleteMany({ where: { barbershopId: user.ownedBarbershops[0].id } });

        // Delete Appointment (if created)
        // Since we created appointment, service, client, professional, we need to clean them.
        // We can use deleteMany for safety if we didn't store IDs globally, or just select.
        // But best is to use the IDs we have.
        // Note: 'appointment', 'service', 'client' variables are in local scope of block above?
        // Wait, they are in `verifyFlow` scope if I defined them with `const`? 
        // Ah, previous Replace defined them inside verifyFlow, but I need to make sure they are accessible or delete by relation.

        await prisma.appointment.deleteMany({ where: { barbershopId: user.ownedBarbershops[0].id } });
        await prisma.service.deleteMany({ where: { barbershopId: user.ownedBarbershops[0].id } });

        // Delete Professional
        await prisma.professional.delete({ where: { userId: user.id } }).catch(() => { }); // catch in case it wasn't created

        // Delete Barbershop (cascades? maybe not)
        await prisma.barbershop.delete({ where: { id: user.ownedBarbershops[0].id } });

        // Delete User
        await prisma.user.delete({ where: { id: user.id } });

        // Delete Client (linked to nothing now? Client has no barbershopId usually, but here we created it)
        // Client ID we know? We didn't save it in outer scope.
        // We should delete client by phone/name if needed, or by ID if we hoist variable.
        // Check `verifyFlow` scope. I inserted code in `verifyFlow` body. `const service = ...` is in `verifyFlow` scope.
        // So I can access `client.id`.
        // However, I wrapped the detailed creation in Step 2.5.
        // The ReplaceFileContent replaced the lines inside verifyFlow. 
        // So `const client` is available.
        // But wait, look at my previous ReplaceFileContent. I added `const client = ...`.
        // If I use `client.id` here, it should be fine.

        // But I need to be careful if I didn't create it (if error happened before).
        // Try/Catch block wraps everything.

        // To be safe, I'll delete Clients created for this test if `client` is defined.
        // Since I can't guarantee `client` is defined if error occurred before 2.5, I shouldn't rely on it unless I check.
        // But `verifyFlow` function scope... `client` is defined after step 2.

        // Cleanup strategy:
        // Use `deleteMany` where possible or use the variables if they exist.
        // Since this is a test script, simplistic cleanup is okay.

        // Actually, Client needs to be deleted.
        // I'll just leave Client validation/deletion loose or query it.
        // Let's rely on cascading or manual delete if I can.
        // But strict variable usage might fail if not defined.

        // Let's use `deleteMany` based on patterns if possible, or just ignore for now if not critical. 
        // But client with unique phone will block next run.
        await prisma.client.deleteMany({ where: { phone: '11988888888' } });

        await prisma.authUser.delete({ where: { email } });

    } catch (error) {
        errorLog('Verification FAILED: ' + error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyFlow();
