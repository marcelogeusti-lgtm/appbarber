require('dotenv').config();
const prisma = require('../src/lib/prisma');
const PaymentService = require('../src/services/payment/PaymentService');

async function testRejectionFlow() {
    console.log('=== Teste de Fluxo de Rejeição ===\n');

    try {
        // 1. Criar um pagamento PENDING para teste
        const barbershop = await prisma.barbershop.findFirst();
        if (!barbershop) throw new Error('No barbershop found');

        console.log(`Usando Barbeiro: ${barbershop.name}`);

        const payment = await prisma.payment.create({
            data: {
                gateway: 'MERCADOPAGO',
                method: 'CREDIT_CARD',
                status: 'PENDING',
                amount: 100.00,
                barbershopId: barbershop.id,
                externalId: 'rejection-test-' + Date.now()
            }
        });

        console.log(`Pagamento criado ID: ${payment.id} / Ext: ${payment.externalId}`);

        // 2. Simular um processamento de webhook com status rejected
        console.log('\nSimulando Webhook de Rejeição...');
        
        // Mock de REQ para o Webhook
        const mockResult = {
            isValid: true,
            type: 'payment',
            externalId: payment.externalId,
            status: 'rejected',
            statusDetail: 'cc_rejected_insufficient_amount' // Saldo insuficiente mapeado
        };

        // Invocando logica de processamento do service (parcialmente simulado)
        // Como o processWebhook chama o Orchestrator que chama a API real,
        // vamos simular o que acontece APÓS a validação do webhook.
        
        const updated = await prisma.payment.update({
            where: { id: payment.id },
            data: { 
                status: mockResult.status,
                statusDetail: mockResult.statusDetail
            }
        });

        console.log(`Status no DB atualizado para: ${updated.status} (${updated.statusDetail})`);

        // 3. Chamar handlePaymentFailure para verificar se o AuditLog é criado
        console.log('\nDisparando handlePaymentFailure...');
        await PaymentService.handlePaymentFailure(updated, mockResult);

        // 4. Verificar Logs
        const lastLog = await prisma.auditLog.findFirst({
            where: { action: 'PAYMENT_FAILED', entityId: payment.id },
            orderBy: { timestamp: 'desc' }
        });

        if (lastLog) {
            console.log('\n [OK] Audit Log criado com sucesso!');
            console.log('      Detalhes do log:', JSON.stringify(lastLog.newData, null, 2));
        } else {
            console.error('\n [ERRO] Audit Log não foi encontrado.');
        }

        // Cleanup
        await prisma.payment.delete({ where: { id: payment.id } });
        console.log('\nTeste finalizado e dados limpos.');

    } catch (err) {
        console.error('Falha no teste:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

testRejectionFlow();
