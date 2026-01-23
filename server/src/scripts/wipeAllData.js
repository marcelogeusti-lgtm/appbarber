/**
 * Script para LIMPEZA TOTAL do Banco de Dados (Wipe)
 * Executa deleteMany em ordem correta para evitar erros de Foreign Key.
 * Uso: node src/scripts/wipeAllData.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔥 INICIANDO LIMPEZA TOTAL DO BANCO DE DADOS...');
    console.log('⚠ TODOS OS DADOS SERÃO PERDIDOS PERMANENTEMENTE.');
    console.log('⏳ Aguardando 5 segundos para cancelamento (Ctrl+C)...');

    await new Promise(resolve => setTimeout(resolve, 5000));

    await prisma.$transaction(async (tx) => {
        // 1. Logs e Históricos
        console.log('🗑 Deletando Logs e Históricos...');
        await tx.webhookLog.deleteMany();
        await tx.communicationLog.deleteMany();
        await tx.noShowRecord.deleteMany();

        // 2. Transacionais e Financeiro
        console.log('🗑 Deletando Transações e Pagamentos...');
        await tx.transaction.deleteMany();
        await tx.payment.deleteMany();
        await tx.commission.deleteMany();
        await tx.professionalServiceCommission.deleteMany();
        await tx.orderItem.deleteMany();
        await tx.order.deleteMany();
        await tx.packageUsage.deleteMany();
        await tx.clientPackage.deleteMany();

        // 3. Agendamentos e Waitlist
        console.log('🗑 Deletando Agendamentos e Agenda...');
        await tx.appointment.deleteMany();
        await tx.waitlist.deleteMany();
        await tx.schedule.deleteMany();

        // 4. Produtos e Serviços
        console.log('🗑 Deletando Produtos, Serviços e Pacotes...');
        await tx.product.deleteMany();
        await tx.service.deleteMany(); // Precisamos remover vinculos de profissionais antes? Service n tem rel pro direto alem de CommissionOverride
        await tx.barbershopPackage.deleteMany();

        // 5. Configurações da Barbearia
        console.log('🗑 Deletando Configurações...');
        await tx.gatewayConfig.deleteMany();
        await tx.webhook.deleteMany();

        // 6. Perfis (Profissional e Cliente)
        console.log('🗑 Deletando Perfis...');
        await tx.professional.deleteMany();
        await tx.client.deleteMany();

        // 7. Users e Barbearias
        // Barbearia tem Owner (User). User tem WorkedBarbershop (Barbershop).
        // Ciclo potencial. Mas User.workedBarbershopId deve ser anulável. 
        // Prisma lida bem se deletarmos Barbershop primeiro se o User não depender dela para existir (o Owner depende?)
        // Barbershop precisa de Owner. User existe antes de Barbershop.
        // Então deletar Barbershop primeiro é seguro para o Owner.
        console.log('🗑 Deletando Barbearias...');
        // Staff link? Staff é relation User.workedBarbershop.
        // Vamos setar null em todos os users staff primeiro para evitar restrict?
        // Mas se deletar barbershop, o SetNull deve funcionar se configurado, ou precisamos limpar.
        // Como vamos deletar Users logo depois, podemos tentar deletar Barbershop.

        await tx.barbershop.deleteMany();

        // 8. Users e Auth
        console.log('🗑 Deletando Usuários e Contas...');
        await tx.user.deleteMany();
        await tx.authUser.deleteMany();
        await tx.subscriptionExternal.deleteMany(); // Esqueci desse no passo 2
    });

    console.log('✅ LIMPEZA CONCLUÍDA COM SUCESSO! O BANCO ESTÁ VAZIO.');
}

main()
    .catch((e) => {
        console.error('❌ Erro durante a limpeza:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
