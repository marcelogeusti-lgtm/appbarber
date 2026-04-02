require('dotenv').config();
const orchestrator = require('./src/services/payment/PaymentOrchestrator');
const prisma = require('./src/lib/prisma');

async function testPixFallback() {
    console.log('=== 🧪 Testing PIX Fallback & Flex Identification 🧪 ===');

    try {
        const paymentParams = {
            barbershopId: null, // Force Platform Fallback
            amount: 0.01,
            method: 'PIX',
            description: 'Test PIX without CPF',
            externalId: `TEST-${Date.now()}`,
            customer: {
                name: 'Test No CPF',
                email: 'test@example.com'
                // NO CPF HERE
            }
        };

        console.log('Orchestrating PIX...');
        const result = await orchestrator.createPayment(paymentParams);
        
        console.log('✅ SUCCESS! PIX Created without CPF.');
        console.log('Payment ID:', result.paymentId);
        console.log('QR Code:', result.qrCode ? 'Extracted' : 'FAILED');

    } catch (err) {
        console.error('❌ FAILED:', err.message);
        if (err.response) console.error(err.response.data);
    } finally {
        await prisma.$disconnect();
    }
}

testPixFallback();
