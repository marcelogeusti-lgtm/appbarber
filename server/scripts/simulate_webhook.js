const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const paymentOrchestrator = require('../src/services/payment/PaymentOrchestrator');
const mercadoPagoAdapter = require('../src/services/payment/gateways/MercadoPagoAdapter');

const prisma = new PrismaClient();

async function run() {
    console.log('[Simulation] Starting Webhook Simulation for Subscription...');

    try {
        // 1. Setup: Create a Mock Client, Barbershop, Plan, Subscription
        console.log('[Simulation] Setting up DB data...');

        // Find or create a barbershop
        const owner = await prisma.user.findFirst();
        if (!owner) throw new Error('No mock user found');

        let barbershop = await prisma.barbershop.findFirst({ where: { slug: 'sim-barber' } });
        if (!barbershop) {
            barbershop = await prisma.barbershop.create({
                data: {
                    name: 'Simulated Barbershop',
                    slug: 'sim-barber',
                    ownerId: owner.id,
                    subscriptionStatus: 'ACTIVE',
                    gatewayConfigs: {
                        create: {
                            gateway: 'MERCADOPAGO',
                            isActive: true,
                            credentials: { accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN' }
                        }
                    }
                }
            });
        }

        const client = await prisma.client.findFirst() || await prisma.client.create({
            data: { name: 'Simulated Client', phone: '999999999' }
        });

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name: 'Simulated Mock Plan',
                price: 50.00,
                barbershopId: barbershop.id,
                externalId: 'mock-plan-id'
            }
        });

        // Create Valid Subscription
        const subscription = await prisma.clientSubscription.create({
            data: {
                clientId: client.id,
                planId: plan.id,
                externalId: '2c938084726fca480172750000000000', // Mock Example Preapproval ID
                status: 'PENDING',
                endDate: new Date()
            }
        });

        console.log(`[Simulation] Created Subscription ${subscription.id} with status ${subscription.status}`);

        // 2. Mock Adapter Response
        // Since we don't want to hit real MP API with fake ID, we will mock the adapter method
        const originalGetStatus = mercadoPagoAdapter.getSubscriptionStatus;
        mercadoPagoAdapter.getSubscriptionStatus = async () => {
            console.log('[Mock Adapter] Returning status authorized');
            return {
                externalId: subscription.externalId,
                status: 'ACTIVE', // Mapped from 'authorized'
                rawResponse: { status: 'authorized' }
            };
        };

        // 3. Trigger Webhook Processing via Orchestrator
        console.log('[Simulation] Triggering Orchestrator...');

        const req = {
            query: { 'data.id': subscription.externalId },
            body: {
                type: 'subscription_preapproval',
                data: { id: subscription.externalId }
            },
            headers: {
                'x-signature': 'ts=123,v1=mock-signature', // Validation will fail if we don't mock validation too or provide secrets
                'x-request-id': 'req-123'
            }
        };

        // Mock Validation to pass
        const originalValidate = mercadoPagoAdapter.validateWebhook;
        mercadoPagoAdapter.validateWebhook = () => true;

        const result = await paymentOrchestrator.processWebhook('mercadopago', req);
        console.log('[Simulation] Result:', result);

        // 4. Mimic Controller Logic (Since we are running script, we don't have the controller's immediate side effects unless we invoke controller logic, but Orchestrator returns status, Controller updates DB)
        // Oops, implementation plan said Orchestrator returns status and *Controller* updates DB.
        // So the script needs to update DB to prove the FLOW works?
        // Or we should verify what the Orchestrator returned.

        // Wait, did I put DB update logic in Controller or Orchestrator? 
        // Logic went into Controller.
        // So orchestrator just returns status.

        if (result.isSubscription && result.status === 'ACTIVE') {
            console.log('[Simulation] Orchestrator correctly identified active status.');

            // Manually applying controller logic for test
            await prisma.clientSubscription.update({
                where: { id: subscription.id },
                data: { status: result.status }
            });
            console.log('[Simulation] DB Updated manually to reflect Controller action.');
        }

        // 5. Verify DB
        const updatedSub = await prisma.clientSubscription.findUnique({ where: { id: subscription.id } });
        console.log(`[Simulation] Final DB Status: ${updatedSub.status}`);

        // Cleanup
        await prisma.clientSubscription.delete({ where: { id: subscription.id } });
        await prisma.subscriptionPlan.delete({ where: { id: plan.id } });
        // Don't delete mock barber/client to avoid cascading issues in dev env if they matter

        // Restore Mocks
        mercadoPagoAdapter.getSubscriptionStatus = originalGetStatus;
        mercadoPagoAdapter.validateWebhook = originalValidate;

    } catch (err) {
        console.error('[Simulation] Failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
