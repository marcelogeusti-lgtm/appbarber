/**
 * Script para LIMPEZA CONTROLADA (Preserva Conta Master)
 * Remove dados operacionais e contas de terceiros.
 * Preserva: User/AuthUser do Master, e (opcionalmente) sua Barbearia se existir, mas limpa o conteúdo.
 * Uso: node src/scripts/wipeExceptMaster.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MASTER_EMAIL = 'marcelogeusti@gmail.com';

async function main() {
    console.log('🛡 INICIANDO LIMPEZA CONTROLADA (PRESERVANDO MASTER)...');
    console.log(`🎯 Conta Master alvo: ${MASTER_EMAIL}`);
    console.log('⏳ Aguardando 5 segundos para cancelamento (Ctrl+C)...');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // 1. Identificar Master
    const masterAuth = await prisma.authUser.findUnique({
        where: { email: MASTER_EMAIL },
        include: { user: true }
    });

    if (!masterAuth) {
        console.error('❌ CONTA MASTER NÃO ENCONTRADA! Verifique o e-mail.');
        console.error(`E-mail buscado: ${MASTER_EMAIL}`);
        process.exit(1);
    }

    const masterUserId = masterAuth.user?.id;
    console.log(`✅ Master identificado! ID: ${masterUserId} (Auth: ${masterAuth.id})`);

    // Executando sequencialmente sem transação única para evitar timeout
    try {
        console.log('--- INICIANDO REMOÇÃO EM CASCATA ---');

        // --- ETAPA 1: DADOS OPERACIONAIS GLOBAIS ---
        console.log('🗑 Limpando Logs...');
        await prisma.webhookLog.deleteMany();
        await prisma.communicationLog.deleteMany();
        await prisma.noShowRecord.deleteMany();

        console.log('🗑 Limpando Financeiro/Transações...');
        await prisma.transaction.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.commission.deleteMany();
        await prisma.professionalServiceCommission.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.packageUsage.deleteMany();
        await prisma.clientPackage.deleteMany();

        console.log('🗑 Limpando Agenda e Filas...');
        await prisma.appointment.deleteMany();
        await prisma.waitlist.deleteMany();
        await prisma.schedule.deleteMany();

        // --- ETAPA 2: DADOS DE TERCEIROS ---
        console.log('🗑 Limpando Profissionais de terceiros...');
        // Deletar profissionais que não são o master
        await prisma.professional.deleteMany({
            where: {
                userId: { not: masterUserId }
            }
        });

        // Se o master for profissional, talvez queiramos limpar schedules dele? 
        // Já limpamos 'schedule.deleteMany()' acima (limpou tudo), então o perfil do master está "vazio" como pedido.

        console.log('🗑 Limpando Clientes...');
        await prisma.client.deleteMany();

        // --- ETAPA 3: BARBEARIAS E SERVIÇOS ---
        const masterBarbershop = await prisma.barbershop.findFirst({
            where: { ownerId: masterUserId }
        });

        let masterShopId = null;
        if (masterBarbershop) {
            console.log(`🔒 Preservando Barbearia do Master: ${masterBarbershop.name} (${masterBarbershop.id})`);
            masterShopId = masterBarbershop.id;
        } else {
            console.log('⚠ Master não possui barbearia vinculada (OwnerId não encontrado).');
        }

        console.log('🗑 Limpando Catálogo (Serviços/Produtos)...');
        await prisma.service.deleteMany();
        await prisma.product.deleteMany();
        await prisma.barbershopPackage.deleteMany();

        await prisma.gatewayConfig.deleteMany();
        await prisma.webhook.deleteMany();

        console.log('🗑 Deletando Barbearias de terceiros...');
        if (masterShopId) {
            await prisma.barbershop.deleteMany({
                where: { id: { not: masterShopId } }
            });
        } else {
            await prisma.barbershop.deleteMany();
        }

        // --- ETAPA 4: USUÁRIOS ---
        console.log('🗑 Deletando Usuários de terceiros...');

        await prisma.user.deleteMany({
            where: { id: { not: masterUserId } }
        });

        await prisma.authUser.deleteMany({
            where: { id: { not: masterAuth.id } }
        });

        // Limpar Assinaturas Externas
        await prisma.subscriptionExternal.deleteMany({
            where: { userId: { not: masterUserId } }
        });

    } catch (err) {
        console.error('❌ ERRO DURANTE A LIMPEZA:', err);
        throw err;
    }

    console.log('✅ LIMPEZA CONTROLADA CONCLUÍDA!');
    console.log('👉 A conta master e estrutura básica foram preservadas.');
}

main()
    .catch((e) => {
        console.error('FATAL ERROR:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
