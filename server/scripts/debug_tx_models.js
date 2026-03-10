const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugTransaction() {
    console.log('--- DEBUGGING TRANSACTION MODELS ---');
    try {
        await prisma.$transaction(async (tx) => {
            const modelsToTest = [
                'notification',
                'payment',
                'subscriptionExternal',
                'auditLog',
                'userSystemUpdateRead',
                'userCourse',
                'pushSubscription',
                'transaction',
                'schedule',
                'professionalServiceCommission',
                'waitlist',
                'noShowRecord',
                'packageUsage',
                'orderItem',
                'order',
                'commission',
                'appointment'
            ];

            modelsToTest.forEach(model => {
                if (tx[model]) {
                    if (typeof tx[model].deleteMany === 'function') {
                        console.log(`[OK] tx.${model}.deleteMany exists.`);
                    } else {
                        console.log(`[ALERT] tx.${model} exists but deleteMany is NOT a function!`);
                    }
                } else {
                    console.log(`[ERROR] tx.${model} is UNDEFINED!`);
                }
            });
            throw new Error('ROLLBACK_INTENTIONAL');
        });
    } catch (e) {
        if (e.message !== 'ROLLBACK_INTENTIONAL') {
            console.error('Unexpected error:', e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

debugTransaction();
