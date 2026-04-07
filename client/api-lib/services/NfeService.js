const prisma = require('../lib/prisma');
const axios = require('axios');
const nodemailer = require('nodemailer');

class NfeService {
    /**
     * Emits a new NFS-e (Service Invoice)
     * @param {Object} params
     * @param {string} params.barbershopId
     * @param {string} [params.appointmentId]
     * @param {string} [params.orderId]
     * @param {string} params.clientId
     * @param {number} params.amount
     */
    static async emitNfe(params) {
        const { barbershopId, appointmentId, orderId, clientId, amount } = params;

        try {
            // 1. Fetch Client and Barbershop Data
            const [client, shop] = await Promise.all([
                prisma.client.findUnique({ where: { id: clientId } }),
                prisma.barbershop.findUnique({ 
                    where: { id: barbershopId },
                    include: { gatewayConfigs: true }
                })
            ]);

            if (!client) throw new Error('Cliente não encontrado.');
            
            // 2. Initial DB Record (PROCESSING)
            const nfeRecord = await prisma.nfe.create({
                data: {
                    barbershopId,
                    clientId,
                    appointmentId,
                    orderId,
                    amount: Number(amount),
                    status: 'PROCESSING'
                }
            });

            // 3. Check for CPF/CNPJ (Critical)
            // Note: In a real scenario, we'd abort or prompt if missing.
            // For now, we simulate the API call.

            // 4. SIMULATED API CALL (MOCK)
            // Replace this block with actual FocusNFe/PlugNotas/Gov logic in the future.
            console.log(`[NfeService] Emitting NFe for ${client.name} - Value: R$ ${amount}`);
            
            // Artificial Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // MOCK Success Response
            const mockResponse = {
                number: Math.floor(Math.random() * 10000).toString(),
                protocol: `PROT-${Date.now()}`,
                pdfUrl: `https://mock-fiscal.com/pdf/${nfeRecord.id}`,
                xmlUrl: `https://mock-fiscal.com/xml/${nfeRecord.id}`
            };

            // 5. Update Status to EMITTED
            const updatedNfe = await prisma.nfe.update({
                where: { id: nfeRecord.id },
                data: {
                    status: 'EMITTED',
                    number: mockResponse.number,
                    protocol: mockResponse.protocol,
                    pdfUrl: mockResponse.pdfUrl,
                    xmlUrl: mockResponse.xmlUrl
                }
            });

            // 6. Send Email Automatically
            await this.sendNfeEmail(client, updatedNfe, shop);

            return updatedNfe;

        } catch (error) {
            console.error('[NfeService] Emission Error:', error);
            
            // Update to ERROR status if record was created
            // ... need to find record if error happened late.
            
            throw error;
        }
    }

    /**
     * Sends the NFe PDF link to the client via email
     */
    static async sendNfeEmail(client, nfe, shop) {
        if (!client.email && !client.authUser?.email) {
            console.log(`[NfeService] No email found for client ${client.name}. skipping email.`);
            return;
        }

        const email = client.email || client.authUser?.email;

        try {
            // Log to EmailLog for traceability
            const logId = await prisma.emailLog.create({
                data: {
                    userId: client.id,
                    email,
                    subject: `Sua Nota Fiscal - ${shop.name}`,
                    status: 'SENDING'
                }
            });

            // Note: Using existing mailing infrastructure if available.
            // For now, simulated send.
            console.log(`[NfeService] Sending NFe email to ${email}...`);

            // Update Log
            await prisma.emailLog.update({
                where: { id: logId.id },
                data: { status: 'SENT' }
            });

        } catch (err) {
            console.error('[NfeService] Email Error:', err);
        }
    }

    /**
     * List NFes for a specific barbershop or client
     */
    static async listNfes(filters) {
        return prisma.nfe.findMany({
            where: filters,
            include: {
                client: { select: { name: true, phone: true } },
                appointment: { select: { date: true, service: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}

module.exports = NfeService;
