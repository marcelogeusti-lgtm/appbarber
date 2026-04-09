/**
 * WalletService STUB (Client API-lib)
 * Esta é uma versão de segurança para evitar que o build da Vercel falhe por falta do arquivo orginal.
 * TODO: Restaurar a lógica original de geração de passes Apple/Google Wallet.
 */

class WalletService {
    static async generateApplePass(clientId, barbershopId) {
        console.warn(`[WalletService] STUB: generateApplePass chamado para cliente ${clientId}. Lógica original ausente.`);
        return Buffer.from("Apple Wallet Service Placeholder");
    }

    static async generateGoogleWalletUrl(clientId, barbershopId) {
        console.warn(`[WalletService] STUB: generateGoogleWalletUrl chamado para cliente ${clientId}. Lógica original ausente.`);
        return "https://wallet.google.com/google-pay/save-to-google-wallet/placeholder";
    }

    static async syncWalletUpdates(clientId, barbershopId) {
        console.warn(`[WalletService] STUB: syncWalletUpdates chamado para cliente ${clientId}. Lógica original ausente.`);
        return true;
    }
}

module.exports = WalletService;
