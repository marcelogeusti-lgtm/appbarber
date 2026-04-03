const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PaymentOrchestrator = require('../src/services/payment/PaymentOrchestrator');

async function test() {
    try {
        console.log('Testing Save Card logic...');
        const client = await prisma.client.findFirst();
        if (!client) {
            console.log('No client found to test.');
            return;
        }

        console.log('Using client:', client.id);
        
        const mp = require('mercadopago');
        console.log('MP SDK available:', Object.keys(mp));
        
        const adapter = PaymentOrchestrator.gateways.mercadopago;
        
        // Let's mock a saveCard call
        console.log('--- TEST: saveCard ---');
        try {
            // This will try to create a customer and save a card.
            // It will FAIL with the MP API because of the token, but it should NOT hang or crash internally.
            const result = await PaymentOrchestrator.saveCard({
                barbershopId: null, // Test Global
                client: client,
                token: 'mock_token_123'
            });
            console.log('Result:', result);
        } catch (cardErr) {
            console.log('Expected/Actual Error from saveCard:', cardErr.message);
        }

        console.log('Debug script finished checking flow.');
        
    } catch (err) {
        console.error('Test Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
