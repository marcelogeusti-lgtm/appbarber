const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreateProduct() {
    console.log('--- TESTING PRODUCT CREATION FIX ---');

    // Find a barbershop to use
    const shop = await prisma.barbershop.findFirst();
    if (!shop) {
        console.log('No barbershop found to test with.');
        await prisma.$disconnect();
        return;
    }

    const payload = {
        name: 'Test Product ' + Date.now(),
        price: '45.50',
        costPrice: '', // Empty string test
        stock: '15',
        barbershopId: shop.id,
        imageUrl: 'http://example.com/image.png',
        isFeatured: true
    };

    console.log('Payload:', payload);

    try {
        // Mocking the controller logic here
        const product = await prisma.product.create({
            data: {
                name: payload.name,
                price: parseFloat(payload.price) || 0,
                costPrice: (payload.costPrice && payload.costPrice !== '') ? parseFloat(payload.costPrice) : null,
                stock: payload.stock ? parseInt(payload.stock) : 0,
                imageUrl: payload.imageUrl,
                isFeatured: payload.isFeatured || false,
                barbershopId: payload.barbershopId
            }
        });

        console.log('SUCCESS: Product created with ID:', product.id);
        console.log('Cleaning up...');
        await prisma.product.delete({ where: { id: product.id } });
        console.log('Cleanup done.');
    } catch (error) {
        console.error('FAILURE:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testCreateProduct();
