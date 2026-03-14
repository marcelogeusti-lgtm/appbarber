const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const phone = "11999999999";
        console.log('Testing create for phone:', phone);
        const client = await prisma.client.create({
            data: {
                name: "Teste",
                phone: phone
            }
        });
        console.log('Success:', client.id);
    } catch (e) {
        console.error('Error Type:', e.constructor.name);
        console.error('Error Message:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
