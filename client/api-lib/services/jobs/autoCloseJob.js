const prisma = require('../../lib/prisma');
const { subHours } = require('date-fns');

/**
 * Job para dar baixa automática em agendamentos/comandas que:
 * 1. Foram agendados com pagamento ONLINE ou SUBSCRIPTION
 * 2. Passaram de 12 horas do horário agendado
 * 3. Ainda estão com status OPEN (Comanda) ou não COMPLETED (Appointment)
 * 4. O pagamento já foi garantido (PaymentStatus = PAID)
 */
const autoCloseJob = async () => {
    console.log('[AutoCloseJob] Iniciando verificação de baixa automática...');
    try {
        const hoursAgo = 12;
        const cutOffTime = subHours(new Date(), hoursAgo);

        // Buscar agendamentos que se encaixam na regra
        const candidates = await prisma.appointment.findMany({
            where: {
                date: { lt: cutOffTime }, // Mais antigo que 12h atrás
                status: { notIn: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] }, // Ainda não finalizado
                paymentStatus: 'PAID', // Pagamento já confirmado (Online/Assinatura)
                paymentMethod: { in: ['ONLINE', 'SUBSCRIPTION'] } // Métodos elegíveis
            },
            include: {
                order: true
            }
        });

        console.log(`[AutoCloseJob] Encontrados ${candidates.length} agendamentos para baixa automática.`);

        let processedCount = 0;

        for (const app of candidates) {
            await prisma.$transaction(async (tx) => {
                // 1. Atualizar Agendamento
                await tx.appointment.update({
                    where: { id: app.id },
                    data: {
                        status: 'COMPLETED',
                        notes: (app.notes || '') + '\n[Sistema] Baixa automática após 12h (No-Show pago).'
                    }
                });

                // 2. Atualizar Comanda (Se existir e estiver aberta)
                if (app.order && app.order.status !== 'CLOSED') {
                    await tx.order.update({
                        where: { id: app.order.id },
                        data: {
                            status: 'CLOSED', // Finaliza a comanda
                            paymentStatus: 'PAID', // Garante status pago
                            // Não alteramos dados financeiros pois já foi pago online/assinatura
                        }
                    });
                }
            });
            processedCount++;
        }

        if (processedCount > 0) {
            console.log(`[AutoCloseJob] Sucesso: ${processedCount} baixas automáticas realizadas.`);
        }

    } catch (error) {
        console.error('[AutoCloseJob] Erro crítico:', error);
    }
};

module.exports = autoCloseJob;
