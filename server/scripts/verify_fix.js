const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyFix() {
    try {
        console.log('Verifying if trialEndsAt column exists and works...');

        // Create a dummy user first (owner)
        const email = `test-verify-${Date.now()}@test.com`;
        const user = await prisma.user.create({
            data: {
                name: 'Test Verify User',
                email: email,
                password: 'password123', // Dummy
                role: 'ADMIN' // or OWNER depending on schema
            }
        });

        const slug = `test-shop-${Date.now()}`;

        // Try to create a barbershop with trialEndsAt
        const trialDate = new Date();
        trialDate.setDate(trialDate.getDate() + 15);

        const barbershop = await prisma.barbershop.create({
            data: {
                name: 'Test Barbershop Verify',
                slug: slug,
                ownerId: user.id,
                subscriptionStatus: 'TRIAL',
                trialEndsAt: trialDate
            }
        });

        console.log('Successfully created barbershop with trialEndsAt:', barbershop);

        if (barbershop.trialEndsAt) {
            console.log('Verification PASSED: trialEndsAt was saved and returned.');
        } else {
            console.error('Verification FAILED: trialEndsAt is missing from returned object.');
        }

        // Cleanup
        await prisma.barbershop.delete({ where: { id: barbershop.id } });
        await prisma.user.delete({ where: { id: user.id } });
        console.log('Cleanup complete.');

    } catch (error) {
        console.error('Verification FAILED with error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyFix();
