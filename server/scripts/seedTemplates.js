const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding global templates...');

    const templates = [
        {
            type: 'appointment_confirmed',
            name: 'Confirmação de Agendamento',
            content: 'Olá {{client_name}}! Seu agendamento para o serviço {{service_name}} com {{professional_name}} está CONFIRMADO para o dia {{date}} às {{time}}. Te esperamos!',
            active: true
        },
        {
            type: 'appointment_cancelled',
            name: 'Cancelamento de Agendamento',
            content: 'Olá {{client_name}}. Seu agendamento para o dia {{date}} foi CANCELADO. Se desejar, você pode agendar um novo horário aqui: {{link}}',
            active: true
        },
        {
            type: 'appointment_completed',
            name: 'Agradecimento (Pós-Serviço)',
            content: 'Olá {{client_name}}! Obrigado pela preferência hoje. Esperamos que tenha gostado do resultado! Se puder, nos avalie no link: {{link}}. Até a próxima!',
            active: true
        }
    ];

    for (const t of templates) {
        await prisma.notificationTemplate.upsert({
            where: { barbershopId_type: { barbershopId: null, type: t.type } },
            update: t,
            create: { ...t, barbershopId: null }
        });
    }

    console.log('Global templates seeded successfully!');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
