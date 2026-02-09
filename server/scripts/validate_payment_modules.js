const MercadoPagoAdapter = require('../src/services/payment/gateways/MercadoPagoAdapter');
const PaymentOrchestrator = require('../src/services/payment/PaymentOrchestrator');

try {
    console.log("Testing MercadoPagoAdapter loading...");
    const adapter = new MercadoPagoAdapter();
    console.log("MercadoPagoAdapter loaded. API URL:", adapter.apiUrl);

    console.log("Testing PaymentOrchestrator loading...");
    if (PaymentOrchestrator) {
        console.log("PaymentOrchestrator loaded.");
    }

    console.log("Syntax check passed.");
} catch (error) {
    console.error("Error loading modules:", error);
    process.exit(1);
}
