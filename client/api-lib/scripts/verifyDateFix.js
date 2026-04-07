const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfDay, endOfDay } = require('date-fns');

const parseBrazilianDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes('-')) return new Date(dateStr);
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}T00:00:00`);
    }
    return new Date(dateStr);
};

async function verify() {
    try {
        const bId = 'b4b6f441-bc91-49b9-b9d2-0782c48d458c';
        const rawStart = '01/03/2026';
        const rawEnd = '14/03/2026';

        const start = parseBrazilianDate(rawStart);
        const end = parseBrazilianDate(rawEnd);

        console.log(`Verifying for Barbershop: ${bId}`);
        console.log(`Interpreted Range: ${start.toISOString()} to ${end.toISOString()}`);

        const transactions = await prisma.transaction.findMany({
            where: {
                barbershopId: bId,
                date: {
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            }
        });

        console.log(`Found ${transactions.length} transactions with the NEW date parsing.`);
        transactions.forEach(t => {
            console.log(`- R$ ${t.amount} | Date: ${t.date.toISOString()}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
