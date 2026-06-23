require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFeatures() {
    console.log("=== Testing AppBarber New Features ===");

    try {
        console.log("\n1. Testing Database Connection & Schema...");
        const logCount = await prisma.messageLog.count();
        console.log(`- messageLog model exists (count: ${logCount})`);

        const bannerCount = await prisma.banner.count();
        console.log(`- banner model exists (count: ${bannerCount})`);

        const barbershops = await prisma.barbershop.findMany({ take: 1 });
        if (barbershops.length === 0) {
            console.log("No barbershop found to test relations.");
            return;
        }

        const bId = barbershops[0].id;
        console.log(`Using barbershop: ${barbershops[0].name} (ID: ${bId})`);

        console.log("\n2. Testing MessageLog Creation...");
        const newLog = await prisma.messageLog.create({
            data: {
                barbershopId: bId,
                type: 'WHATSAPP',
                recipient: '5511999999999',
                status: 'SENT',
                body: 'Test message for logging.'
            }
        });
        console.log(`- Created log: ${newLog.id}`);

        console.log("\n3. Testing Banner Creation...");
        const newBanner = await prisma.banner.create({
            data: {
                barbershopId: bId,
                title: 'Test Banner',
                imageUrl: 'https://test.com/img.jpg',
                linkUrl: 'https://test.com',
                active: true
            }
        });
        console.log(`- Created banner: ${newBanner.id}`);

        console.log("\n4. Cleaning up test data...");
        await prisma.messageLog.delete({ where: { id: newLog.id } });
        await prisma.banner.delete({ where: { id: newBanner.id } });
        console.log("- Cleanup complete.");

        console.log("\n=== All Tests Passed Successfully! ===");

    } catch (e) {
        console.error("\nERROR during testing:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testFeatures();
