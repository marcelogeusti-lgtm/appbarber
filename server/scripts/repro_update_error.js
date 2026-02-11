const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const userId = '50ccbb50-aba4-44eb-8967-ef7d5f37fe1d'; // Currently master@appbarber.com.br
        console.log(`Testing update for User ID: ${userId}`);

        // Mock request body - Case 3: Unique Constraint Violation (Email)
        console.log('\n--- Case 3: Unique Constraint Violation (Email) ---');
        // Existing email from another user (Wanielly)
        await simulateUpdate(userId, { email: 'wanielly2357@gmail.com' });

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function simulateUpdate(id, body) {
    // Simulate Controller Logic (MIRRORING THE NEW IMPLEMENTATION)
    try {
        const {
            name, email, phone, commissionPercent, schedules
        } = body;

        console.log(`[Sim] Request Body:`, body);

        const normalize = (str) => str ? str.trim() : null;

        // Simulating the transaction logic from controller
        const updated = await prisma.$transaction(async (tx) => {

            // Prepare Update Data (Simplified for sim)
            const updateData = {};
            if (email !== undefined) updateData.email = email ? email.trim().toLowerCase() : null;

            // Update User
            console.log(`[Sim] Updating User ${id}...`);
            const user = await tx.user.update({
                where: { id },
                data: updateData
            });

            return user;
        });

        console.log('✅ Update Successful (UNEXPECTED if conflict)');
    } catch (error) {
        // MIRRORING THE ERROR HANDLING
        console.error('❌ Update Failed (Caught in Catch):');

        if (error.code === 'P2002') {
            const target = error.meta?.target;
            console.log(`[Sim] CAUGHT P2002! Target: ${JSON.stringify(target)}`);

            if (target && Array.isArray(target) && target.includes('email')) {
                console.log(">> RESPONSE 400: Este e-mail já está sendo usado por outro usuário. (SUCCESSFUL TEST)");
                return;
            }
            // ... strict check mirroring
            console.log(">> RESPONSE 400: Dados duplicados.");
        } else {
            console.error(error);
        }
    }
}

run();
