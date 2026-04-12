
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backup() {
    console.log('--- STARTING CRITICAL BACKUP ---');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../../../../backups/snapshots', `pre-auth-fix-${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const tables = [
        'authUser',
        'user',
        'client',
        'professional',
        'barbershop'
    ];

    for (const table of tables) {
        console.log(`Backing up ${table}...`);
        try {
            const data = await prisma[table].findMany();
            fs.writeFileSync(
                path.join(backupDir, `${table}.json`),
                JSON.stringify(data, null, 2)
            );
        } catch (err) {
            console.error(`Error backing up ${table}:`, err.message);
        }
    }

    console.log(`--- BACKUP COMPLETED: ${backupDir} ---`);
}

backup()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
