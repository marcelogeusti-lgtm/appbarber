try {
    console.log("1. Carregando crypto util...");
    const crypto = require('../src/utils/crypto');
    console.log("Crypto carregado. Teste:", crypto.encrypt ? "OK" : "Missing encrypt");

    console.log("2. Carregando MercadoPagoAdapter...");
    const MercadoPagoAdapter = require('../src/services/payment/gateways/MercadoPagoAdapter');
    console.log("Adapter carregado.");

    console.log("3. Carregando PaymentOrchestrator...");
    const PaymentOrchestrator = require('../src/services/payment/PaymentOrchestrator');
    console.log("Orchestrator carregado.");

} catch (error) {
    console.error("ERRO FATAL:", error);
}
