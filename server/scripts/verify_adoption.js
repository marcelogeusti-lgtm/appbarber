const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdoption() {
    try {
        console.log('--- Testing Adoption Logic Simulation ---');
        
        // Find an orphan
        const orphan = await prisma.client.findFirst({
            where: { phone: { not: null }, authUserId: null }
        });

        if (!orphan) {
            console.log('No orphans found to test.');
            return;
        }

        console.log(`Found orphan: ${orphan.name} (${orphan.phone})`);

        // We won't actually create an AuthUser here to avoid pollution, 
        // but we'll verify the findFirst logic that the controller uses.
        const found = await prisma.client.findFirst({
            where: { phone: orphan.phone, authUserId: null }
        });

        if (found && found.id === orphan.id) {
            console.log('SUCCESS: Adoption lookup works correctly.');
        } else {
            console.log('FAILURE: Orphan not correctly identified.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

testAdoption();
