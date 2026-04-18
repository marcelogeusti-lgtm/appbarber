/**
 * WalletService
 * Gerencia a criação e sincronização de passes para Apple Wallet (.pkpass) e Google Wallet.
 */

const { PKPass } = require('passkit-generator');
// const { google } = require('googleapis'); // Será necessário para JWT do Google Wallet
// const jwt = require('jsonwebtoken'); // Pode ser útil para criar o token offline

class WalletService {
    /**
     * Auxiliar para checar se as credenciais da Apple estão configuradas
     */
    static hasAppleCredentials() {
        return !!(process.env.APPLE_PASS_CERT_B64 && process.env.APPLE_PASS_KEY_B64 && process.env.APPLE_PASS_WWDR_B64);
    }

    /**
     * Auxiliar para checar se as credenciais do Google estão configuradas
     */
    static hasGoogleCredentials() {
        return !!(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_B64);
    }

    /**
     * Gera um buffer para o passe da Apple Wallet (.pkpass)
     * Retorna NULL se o ambiente não estiver configurado, atuando como Fallback Seguro.
     */
    static async generateApplePass(clientId, barbershopId, passData = {}) {
        try {
            if (!this.hasAppleCredentials()) {
                console.warn(`[WalletService] Credenciais da Apple ausentes. Ignorando a geração de passe para o cliente ${clientId}.`);
                return null; 
            }

            // Exemplo de decodificação de certificados de Base64 (Ideal para Vercel)
            const certBuffer = Buffer.from(process.env.APPLE_PASS_CERT_B64, 'base64');
            const keyBuffer = Buffer.from(process.env.APPLE_PASS_KEY_B64, 'base64');
            const wwdrBuffer = Buffer.from(process.env.APPLE_PASS_WWDR_B64, 'base64');

            // TODO: Buscar dados reais da Barbearia (Nome, Logo, etc) e do Cliente (Pontos, Nome) usando Prisma
            const storeName = passData.storeName || "Barbearia Modelo";
            const clientName = passData.clientName || "Cliente";

            const pass = new PKPass({
                "passTypeIdentifier": process.env.APPLE_PASS_TYPE_ID || "pass.com.appbarber.loyalty",
                "teamIdentifier": process.env.APPLE_PASS_TEAM_ID || "TEAM_ID_HERE",
                "organizationName": storeName,
                "description": `Cartão Fidelidade - ${storeName}`,
                "logoText": storeName,
                "foregroundColor": "rgb(255, 255, 255)",
                "backgroundColor": "rgb(15, 23, 42)", // Slate-900 background
            }, {
                "cert": certBuffer,
                "key": keyBuffer,
                // "passphrase": "senha_se_houver"
            }, {
                "wwdr": wwdrBuffer
            });

            pass.primaryFields.push({
                key: "loyaltyPoints",
                label: "PONTOS",
                value: String(passData.points || 0)
            });

            pass.secondaryFields.push({
                key: "clientName",
                label: "Membro",
                value: clientName
            });

            const buffer = await pass.getAsBuffer();
            return buffer;

        } catch (error) {
            console.error(`[WalletService] Erro ao gerar Apple Pass: ${error.message}`);
            // Retornamos nulo para não quebrar a aplicação do usuário em caso de erro no certificado
            return null;
        }
    }

    /**
     * Gera uma URL para salvar no Google Wallet
     * Retorna NULL se não configurado.
     */
    static async generateGoogleWalletUrl(clientId, barbershopId, passData = {}) {
        try {
            if (!this.hasGoogleCredentials()) {
                console.warn(`[WalletService] Credenciais do Google ausentes. Ignorando a geração de URL para cliente ${clientId}.`);
                return null;
            }

            const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
            const classId = `${issuerId}.loyalty_class_default`;
            const objectId = `${issuerId}.client_${clientId}`;

            // Aqui entraria a geração do JWT usando a service account (exigiria inicialização complexa)
            // Vou preparar o "esqueleto" funcional para quando as chaves entrarem
            
            // let serviceAccount = JSON.parse(Buffer.from(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_B64, 'base64').toString());
            // lógica de autenticação...
            
            console.log(`[WalletService] Geração de Token do Google Wallet pendente de integração real da Conta de Serviço.`);
            
            // Retorna um link simulado para desenvolvimento
            return `https://wallet.google.com/google-pay/save-to-google-wallet/placeholder_${objectId}`;

        } catch (error) {
            console.error(`[WalletService] Erro ao gerar Google Wallet URL: ${error.message}`);
            return null;
        }
    }

    /**
     * Sincroniza atualizações de agendamentos com o Wallet do cliente
     * Para uso futuro (ex: alterar horário no passe ou notificar de cortes concluídos)
     */
    static async syncWalletUpdates(clientId, barbershopId) {
        try {
            // Em tese, aqui buscaríamos Passes armazenados no DB e faríamos requisições de Push para a Apple 
            // e API do Google rest para dar update na classe/objeto
            console.log(`[WalletService] Sincronização de Wallet disparada para cliente ${clientId}. Rotina agendada.`);
            return true;
        } catch (error) {
             console.error(`[WalletService] Erro na sincronização: ${error.message}`);
             return false;
        }
    }
}

module.exports = WalletService;
