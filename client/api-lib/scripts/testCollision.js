const { PrismaClient } = require('@prisma/client');
const { generateUniqueSlug } = require('../utils/slugGenerator');

const prisma = new PrismaClient();

async function testCollision() {
    try {
        console.log('--- TEST COLLISION ---');

        const baseName = "Barbearia Teste Unico";

        // 1. Simulate First Creation
        console.log(`1. Generating slug for "${baseName}"...`);
        const slug1 = await generateUniqueSlug(prisma, baseName);
        console.log('Creates:', slug1);

        // Mock checking "if it was created" (In real app, we would insert it)
        // Since we are not inserting into DB to avoid pollution, we will rely on logic review or temporary insert/delete
        // Let's create a temp record in DB to actually test the DB check inside helper

        const shop1 = await prisma.barbershop.create({
            data: {
                name: baseName,
                slug: slug1,
                // Mock required relations if any (simplifying) - Owner/Staff required in schema?
                // Owner is required. We need a dummy user.
                owner: {
                    create: {
                        name: 'Temp Tester 1',
                        email: `temp${Date.now()}@test.com`,
                        password: 'hash',
                        role: 'ADMIN'
                    }
                }
            }
        });
        console.log('INSERTED ID:', shop1.id, 'SLUG:', shop1.slug);

        // 2. Simulate Second Creation SAME NAME
        console.log(`2. Generating slug for "${baseName}" (2nd time)...`);
        const slug2 = await generateUniqueSlug(prisma, baseName);
        console.log('Expected: suffixed. Got:', slug2);

        // Cleanup
        console.log('Cleaning up...');
        await prisma.barbershop.delete({ where: { id: shop1.id } });
        await prisma.user.delete({ where: { id: shop1.ownerId } });
        console.log('Cleanup Done.');

    } catch (e) {
        console.error('Collision Test Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testCollision();
