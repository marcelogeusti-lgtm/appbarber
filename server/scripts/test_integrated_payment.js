require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
// O módulo exporta uma instância (new PaymentOrchestrator())
const orchestrator = require('../src/services/payment/PaymentOrchestrator');

const prisma = new PrismaClient();

const METHOD = process.argv[2] || 'BOLETO'; // PIX or BOLETO

async function testIntegratedPayment() {
    console.log(`=== Teste Integrado de Pagamento (${METHOD}) ===`);

    try {
        // 1. Buscar Barbearia e Credenciais
        const barbershop = await prisma.barbershop.findFirst({
            include: { gatewayConfigs: true }
        });

        if (!barbershop) {
            console.error("Nenhuma barbearia encontrada no banco.");
            return;
        }

        console.log(`Barbearia Encontrada: ${barbershop.name} (ID: ${barbershop.id})`);

        const mpConfig = barbershop.gatewayConfigs.find(g => g.gateway === 'MERCADOPAGO');

        // Simular credenciais se não existirem no banco SOMENTE PARA O TESTE (Falllback)
        // Mas o ideal é que existam, pois o usuário acabou de configurar.
        if (!mpConfig || !mpConfig.credentials) {
            console.error("Configuração do Mercado Pago não encontrada para esta barbearia.");
            console.log("Configs existentes:", barbershop.gatewayConfigs.map(c => c.gateway));
            // return; // Don't return, try with env vars if available? 
            // Better to fail if integration is strictly DB based.
        } else {
            console.log("Credenciais Mercado Pago encontradas no banco.");
        }

        // 2. Simular Payload de Pagamento
        const paymentData = {
            barbershopId: barbershop.id,
            amount: 5.00, // Valor baixo para teste
            method: METHOD, // BOLETO, PIX
            description: `Teste Integrado ${METHOD} - ${new Date().toISOString()}`,
            externalId: `TEST-${Date.now()}`,
            customer: {
                name: 'APRO Test User', // APRO triggers approved/action_required in sandbox
                email: 'test@testuser.com', // E-mail de teste obrigatório
                cpf: '12345678909' // CPF válido para teste
            },
            payer: {
                identification: {
                    type: 'CPF',
                    number: '12345678909'
                }
            }
        };

        console.log("Iniciando criação de pagamento via Orchestrator...");

        // Orchestrator expect params directly
        const result = await orchestrator.createPayment(paymentData);

        console.log("\n=== SUCESSO! Pagamento Criado ===");
        console.log(`ID Externo (Order): ${result.paymentId || result.externalId}`);
        console.log(`Status: ${result.status}`);
        if (result.checkoutUrl) console.log(`Link Boleto/Checkout: ${result.checkoutUrl}`);
        if (result.qrCode) console.log(`QR Code (Pix): Presente`);

        // Verificação final via script de status
        console.log(`\nPara verificar status: node scripts/check_order_status.js ${result.paymentId || result.externalId}`);

    } catch (error) {
        console.error("\n=== ERRO NO TESTE ===");
        console.error(error.message);
        require('fs').writeFileSync('short_error.txt', error.message + '\n' + (error.stack || ''));
        if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

testIntegratedPayment();
