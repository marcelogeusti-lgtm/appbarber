require('dotenv').config();
const PaymentOrchestrator = require('../src/services/payment/PaymentOrchestrator');

async function testCreateOrder() {
    console.log("=== Testando Criação de Order (Pix) no Mercado Pago ===");

    try {
        // Simular dados do agendamento/pagamento
        const params = {
            method: 'PIX',
            barbershopId: 'test-barbershop-id', // ID fictício, o Orchestrator vai tentar buscar configs
            amount: 10.00,
            description: 'Teste Integração Orders API',
            externalId: `test_order_${Date.now()}`,
            customer: {
                email: 'test_user_123@test.com',
                name: 'Test User'
            },
            // Mock de credenciais para bypassar o banco de dados se necessário, 
            // mas o Orchestrator tenta buscar do banco. 
            // Se falhar no banco, precisamos garantir que o Adapter funcione.
            // O Orchestrator.js atual tenta buscar configs do Banco.
            // Para teste isolado, talvez seja melhor chamar o Adapter direto se não tivermos banco local rodando com dados.
        };

        console.log("Tentando inicializar Adapter diretamente para teste isolado...");
        const MercadoPagoAdapter = require('../src/services/payment/gateways/MercadoPagoAdapter');
        const adapter = new MercadoPagoAdapter();

        // Credenciais de Teste (Ler do .env ou usar dummy falhará se não tiver .env)
        const credentials = {
            accessToken: process.env.MP_ACCESS_TOKEN
        };

        if (!credentials.accessToken) {
            console.error("ERRO: MP_ACCESS_TOKEN não definido no .env");
            return;
        }

        console.log("Enviando requisição para Mercado Pago...");
        const result = await adapter.createPayment({
            ...params,
            credentials
        });

        console.log("\n=== SUCESSO! Order Criada ===");
        console.log("ID da Order:", result.externalId);
        console.log("Status:", result.status);
        console.log("QR Code (Copia e Cola):", result.pixCopiaECola ? (result.pixCopiaECola.substring(0, 50) + "...") : "Não retornado");
        console.log("Checkout URL:", result.checkoutUrl);
        console.log("Raw Response Status:", result.rawResponse?.status);

    } catch (error) {
        console.error("\n=== ERRO ===");
        console.error(error.message);
        if (error.response) {
            console.error("Detalhes da API:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCreateOrder();
