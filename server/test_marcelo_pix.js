require('dotenv').config();
const orchestrator = require('./src/services/payment/PaymentOrchestrator');
const prisma = require('./src/lib/prisma');

async function testMarceloPix() {
    console.log('=== 🧪 Testing PIX for Marcelo Geusti 🧪 ===');

    try {
        // 1. Resolve Marcelo's Client and Barbershop
        const authUser = await prisma.authUser.findUnique({
            where: { email: 'marcelogeusti@gmail.com' },
            include: { client: true, user: { include: { ownedBarbershops: true } } }
        });

        if (!authUser || !authUser.client) {
            throw new Error('Client profile not found for marcelogeusti@gmail.com');
        }

        const barbershop = authUser.user?.ownedBarbershops?.[0]; // Get the first owned shop
        if (!barbershop) {
            throw new Error('No barbershop found for this user');
        }

        console.log(`Using Client: ${authUser.client.name} (${authUser.client.id})`);
        console.log(`Using Barbershop: ${barbershop.name} (${barbershop.id})`);

        const paymentParams = {
            barbershopId: barbershop.id,
            clientId: authUser.client.id,
            amount: 1.50,
            method: 'PIX',
            description: 'Teste de Pagamento Principal',
            externalId: `MAIN-TEST-${Date.now()}`,
            customer: {
                name: authUser.client.name,
                email: authUser.email
            }
        };

        console.log('Orchestrating PIX creation...');
        const result = await orchestrator.createPayment(paymentParams);
        
        console.log('\n✅ SUCCESS!');
        console.log('Payment ID:', result.paymentId);
        console.log('Status:', result.status);
        console.log('Status Detail:', result.statusDetail);
        if (result.qrCode) console.log('QR Code generated successfully.');
        if (result.pixCopiaECola) console.log('PIX Copy/Paste string available.');

    } catch (err) {
        console.error('\n❌ FAILED:', err.message);
        if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

testMarceloPix();
