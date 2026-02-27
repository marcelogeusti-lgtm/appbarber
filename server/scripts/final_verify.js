
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    try {
        const clientId = '9e464e88-b1d5-4bad-8a4c-793838904ead';
        const apps = await prisma.appointment.findMany({ where: { clientId } });

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        console.log(`Verifying ${apps.length} appointments against today: ${today.toISOString()}`);

        const scheduled = apps.filter(a => {
            const appDate = new Date(a.date);
            return (a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'SCHEDULED') && appDate >= today;
        });

        const missing = apps.filter(a => a.barbershopId === '60e2de8a-0a99-4df0-b60c-c68781f29c90');

        console.log(`Agendamentos futuros (Scheduled): ${scheduled.length}`);
        console.log(`Agendamentos na barbearia 'Corte': ${missing.length}`);

        const corteInScheduled = scheduled.filter(s => missing.some(m => m.id === s.id));
        console.log(`Agendamentos da 'Corte' que aparecerão como agendados: ${corteInScheduled.length}`);

        if (corteInScheduled.length === missing.length) {
            console.log('SUCCESS: All missing appointments will now show up.');
        } else {
            console.log('WARNING: Some appointments might still be hidden.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

verify();
