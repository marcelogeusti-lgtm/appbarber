const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        const email = 'marcelogeusti@gmail.com';
        const restorePassword = process.env.MASTER_RESTORE_PASSWORD;
        if (!restorePassword) {
            console.error('Defina MASTER_RESTORE_PASSWORD antes de rodar este script.');
            process.exit(1);
        }
        const hashedPassword = await bcrypt.hash(restorePassword, 10);

        await prisma.authUser.update({
            where: { email },
            data: { 
                password: hashedPassword,
                provider: 'EMAIL'
            }
        });

        console.log('--- CREDENTIALS RESTORED SUCCESSFULLY ---');
        console.log(`User: ${email}`);
        console.log('Original password has been restored.');

    } catch (err) {
        console.error('Restore failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}
run();
