
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load .env
const { PrismaClient } = require('@prisma/client');
const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const paymentController = require('../controllers/payment.controller');

const logFile = path.join(__dirname, 'test_brick_output.txt');

// Mock Express Request/Response
const mockReq = (body, user) => ({
    body,
    user: user || { id: 'test-user-id' }
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

function log(msg) {
    const message = (typeof msg === 'object') ? JSON.stringify(msg, null, 2) : msg;
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
}

async function main() {
    // Clear previous log
    fs.writeFileSync(logFile, '');
    const prisma = new PrismaClient();

    try {
        log('--- Iniciando Teste de Integração Payment Brick ---');

        // 1. Setup Data: Find a Barbershop WITH Gateway Config
        // Instead of random one, find one that has credentials
        const gatewayConfigs = await prisma.gatewayConfig.findMany({
            where: {
                gateway: 'MERCADOPAGO',
                isActive: true
            },
            include: { barbershop: true },
            take: 1
        });

        let barbershop;
        if (gatewayConfigs.length > 0) {
            barbershop = gatewayConfigs[0].barbershop;
            const creds = gatewayConfigs[0].credentials || {};
            log(`✅ Encontrada barbearia com credenciais: ${barbershop.name}`);
            log(`   Credential Keys: ${Object.keys(creds).join(', ')}`);
            log(`   AccessToken Present? ${!!creds.accessToken}`);
        } else {
            // Fallback to random if no config found (will fail at gateway but pass logic up to there)
            barbershop = await prisma.barbershop.findFirst();
            log(`⚠️ Nenhuma config encontrada. Usando primeira barbearia: ${barbershop?.name}`);
        }

        if (!barbershop) throw new Error('Nenhuma barbearia encontrada para teste.');

        const user = await prisma.user.findFirst({ include: { authUser: true } });
        if (!user) throw new Error('Nenhum usuário encontrado para teste.');


        log(`Usando Barbearia: ${barbershop.name} (ID: ${barbershop.id})`);

        // Check ENV
        const envToken = process.env.MP_ACCESS_TOKEN;
        log(`MP_ACCESS_TOKEN Presente no ENV? ${envToken ? 'SIM (' + envToken.slice(0, 5) + '...)' : 'NÃO'}`);

        // Ensure GatewayConfig exists
        let gatewayConfig = await prisma.gatewayConfig.findUnique({
            where: {
                barbershopId_gateway: {
                    barbershopId: barbershop.id,
                    gateway: 'MERCADOPAGO'
                }
            }
        });

        log(`Usando Usuário: ${user.name} (ID: ${user.id})`);

        log('Testando getGatewayConfig diretamente...');
        try {
            const verifyCreds = await PaymentOrchestrator.getGatewayConfig(barbershop.id, 'mercadopago');
            log(`Verify Creds Keys: ${Object.keys(verifyCreds).join(', ')}`);
            log(`Verify AccessToken: ${verifyCreds.accessToken ? (verifyCreds.accessToken.slice(0, 5) + '...') : 'MISSING'}`);
        } catch (err) {
            log(`Erro ao testar getGatewayConfig: ${err.message}`);
        }

        // Create a Dummy Appointment
        let service = await prisma.service.findFirst({ where: { barbershopId: barbershop.id } });

        if (!service) {
            log('Criando serviço de teste...');
            service = await prisma.service.create({
                data: {
                    name: 'Corte Teste',
                    price: 50.00,
                    duration: 30,
                    barbershopId: barbershop.id,
                    description: 'Serviço de teste criado automaticamente',
                    commissionType: 'PERCENTAGE',
                    commissionValue: 50
                }
            });
        }

        // Find a User who is a Professional (or just acts as one for the test)
        // Ideally one linked to the shop.
        const professionalUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { role: 'BARBER' },
                    { role: 'ADMIN' },
                    { professionalProfile: { isNot: null } }
                ]
            }
        });

        // Client is global, not scoped to barbershopId directly in schema (it seems).
        // Try to find one with appointments in this shop, or just any client.
        let client = await prisma.client.findFirst({
            where: {
                appointments: { some: { barbershopId: barbershop.id } }
            }
        });

        if (!client) {
            // Fallback: any client
            client = await prisma.client.findFirst();
        }

        if (!client) {
            // Create dummy client if DB is empty
            client = await prisma.client.create({
                data: {
                    name: 'Test Client',
                    phone: '99999999999'
                }
            });
        }

        if (!service || !professionalUser || !client) {
            throw new Error(`Dados incompletos: Service=${!!service}, Pro=${!!professionalUser}, Client=${!!client}`);
        }

        const appointment = await prisma.appointment.create({
            data: {
                barbershopId: barbershop.id,
                clientId: client.id,
                professionalId: professionalUser.id,
                serviceId: service.id,
                date: new Date(),
                status: 'PENDING'
            }
        });
        log(`Agendamento criado: ${appointment.id}`);

        // 2. Simulate Brick Payload (Credit Card)
        const brickPayload = {
            transaction_amount: Number(service.price),
            description: 'Teste Brick',
            payment_method_id: 'master',
            payer: {
                email: 'test_user_123456@testuser.com',
                first_name: 'Test',
                last_name: 'User',
                identification: { type: 'CPF', number: '19119119100' }
            },
            token: 'test_token_123', // In real life this is a valid token
            installments: 1,
            issuer_id: '203', // MasterCard
            barbershopId: barbershop.id,
            appointmentId: appointment.id
        };

        // 3. Invoke Controller Logic
        const req = mockReq(brickPayload, user);
        const res = mockRes();

        // Warning: This will attempt to call Mercado Pago API.
        // Since the token is fake ('test_token_123'), it will likely fail at the Gateway level,
        // BUT we verify that it creates the Pending Payment in DB and attempts the call.

        log('Executando createBrickPayment...');
        await paymentController.createBrickPayment(req, res);

        log(`Status Code: ${res.statusCode}`);
        log('Response Data: ' + JSON.stringify(res.data, null, 2));

        // 4. Verification
        if (res.statusCode === 201) {
            log('✅ SUCESSO: Controller retornou 201 Created.');
        } else if (res.statusCode === 502) {
            log('⚠️ SUCESSO PARCIAL: Controller executou, mas Gateway rejeitou (esperado com token fake).');
        } else {
            log('❌ FALHA: Status code inesperado.');
        }

        // Check DB for Payment
        const payment = await prisma.payment.findFirst({
            where: { appointmentId: appointment.id },
            orderBy: { createdAt: 'desc' }
        });

        if (payment) {
            log(`✅ Pagamento encontrado no banco: ${payment.id}`);
            log(`   Status: ${payment.status}`);
            log(`   Gateway: ${payment.gateway}`);
            log(`   External ID: ${payment.externalId}`);
        } else {
            log('❌ FALHA: Nenhum pagamento persistido no banco.');
        }

        // Cleanup
        await prisma.appointment.delete({ where: { id: appointment.id } });
        if (payment) await prisma.payment.delete({ where: { id: payment.id } });

    } catch (e) {
        log('❌ ERRO CRÍTICO NO SCRIPT:');
        log(e.message);
        if (e.meta) log('Meta:', e.meta);
        log(e.stack);
    } finally {
        await prisma.$disconnect();
    }
}

main();
