const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function debug() {
    let output = '';
    const log = (msg) => { output += msg + '\n'; };

    try {
        log('--- DATABASE DIAGNOSTIC START ---');

        const appointmentCount = await prisma.appointment.count();
        log(`TOTAL_APPOINTMENTS: ${appointmentCount}`);

        const latestAppointments = await prisma.appointment.findMany({
            take: 40,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                date: true,
                status: true,
                barbershopId: true,
                clientId: true,
                createdAt: true,
                client: { select: { name: true, phone: true, authUserId: true } },
                barbershop: { select: { name: true, slug: true } }
            }
        });

        log('\nLATEST_40_APPOINTMENTS:');
        latestAppointments.forEach(app => {
            const dateStr = app.date instanceof Date ? app.date.toISOString() : app.date;
            const createdStr = app.createdAt instanceof Date ? app.createdAt.toISOString() : app.createdAt;
            log(`[${createdStr}] ID: ${app.id} | Date: ${dateStr} | Client: ${app.client?.name || 'N/A'} | ClientID: ${app.clientId} | authUID: ${app.client?.authUserId || 'NONE'} | Shop: ${app.barbershop?.name || 'N/A'} | Status: ${app.status}`);
        });

        const authUsers = await prisma.authUser.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                client: { select: { id: true, name: true } },
                user: { select: { id: true, name: true, role: true } }
            }
        });
        log('\nAUTH_USERS (Latest 50):');
        authUsers.forEach(u => {
            log(`ID: ${u.id} | Email: ${u.email} | ClientID: ${u.client?.id || 'NONE'} | ProID: ${u.user?.id || 'NONE'} | Role: ${u.user?.role || 'CLIENT_ONLY'}`);
        });

        log('--- DATABASE DIAGNOSTIC END ---');

        fs.writeFileSync('diagnostic_results_v2.txt', output);
        console.log('Results written to diagnostic_results_v2.txt');

    } catch (e) {
        console.error('DIAGNOSTIC_ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
