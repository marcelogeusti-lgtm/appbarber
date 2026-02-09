const MercadoPagoAdapter = require('../src/services/payment/gateways/MercadoPagoAdapter');

try {
    const adapter = new MercadoPagoAdapter();
    console.log("MercadoPagoAdapter loaded successfully.");
    console.log("API URL:", adapter.apiUrl);
} catch (error) {
    console.error("Error loading MercadoPagoAdapter:", error);
    process.exit(1);
}
