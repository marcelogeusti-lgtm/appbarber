const TransactionService = require('../src/services/TransactionService');
const prisma = require('../src/lib/prisma');

async function testNfeIntegration() {
    console.log('--- Testing NFe Integration ---');

    try {
        // 1. Get a sample appointment
        const apt = await prisma.appointment.findFirst({
            where: { status: 'CONFIRMED' },
            include: { barbershop: true, client: true }
        });

        if (!apt) {
            console.log('No confirmed appointment found to test. Skipping.');
            return;
        }

        console.log(`Found appointment ${apt.id} for client ${apt.client.name}`);

        // 2. Call TransactionService with emitNfe: true
        console.log('Calling TransactionService.createTransaction with emitNfe: true...');
        const tx = await TransactionService.createTransaction({
            barbershopId: apt.barbershopId,
            amount: Number(apt.service?.price || 50),
            method: 'PIX',
            appointmentId: apt.id,
            description: 'Teste de Emissão de NFe',
            emitNfe: true
        });

        console.log('Transaction created:', tx.id);

        // 3. Wait for Nfe record to be created/processed
        console.log('Waiting 3 seconds for async NFe processing...');
        await new Promise(r => setTimeout(r, 3000));

        // 4. Check Nfe record
        const nfe = await prisma.nfe.findFirst({
            where: { appointmentId: apt.id },
            orderBy: { createdAt: 'desc' }
        });

        if (nfe) {
            console.log('✅ NFe record found!');
            console.log('Status:', nfe.status);
            console.log('Number:', nfe.number);
            console.log('PDF URL:', nfe.pdfUrl);
        } else {
            console.error('❌ NFe record NOT found for appointment.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testNfeIntegration();
