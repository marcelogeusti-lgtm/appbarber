const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const rootDir = path.join(__dirname, '../../../');
const backupBaseDir = path.join(rootDir, 'backups/db_dumps');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const targetDir = path.join(backupBaseDir, `dump-${timestamp}`);

// Lista de modelos críticos para backup
const models = [
    'AuthUser',
    'User',
    'Client',
    'Barbershop',
    'Service',
    'Professional',
    'Appointment',
    'Product',
    'Transaction',
    'Order',
    'SubscriptionPlan',
    'ClientSubscription',
    'Commission',
    'LoyaltyProgram',
    'CashShift',
    'Review',
    'Waitlist',
    'GatewayConfig'
];

async function dumpDatabase() {
    console.log(`[DB Dump] Iniciando exportação para JSON em: ${targetDir}`);
    
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    for (const modelName of models) {
        console.log(`[DB Dump] Exportando tabela: ${modelName}...`);
        try {
            // Acessando dinamicamente o modelo no prisma client
            const lowerModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
            if (prisma[lowerModelName]) {
                const data = await prisma[lowerModelName].findMany();
                const filePath = path.join(targetDir, `${modelName}.json`);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                console.log(`[DB Dump] ✅ ${modelName}: ${data.length} registros salvos.`);
            } else {
                console.warn(`[DB Dump] ⚠️ Modelo ${modelName} não encontrado no Prisma Client.`);
            }
        } catch (err) {
            console.error(`[DB Dump] ❌ Erro ao exportar ${modelName}:`, err.message);
        }
    }

    console.log(`[DB Dump] Finalizado com sucesso.`);
}

if (require.main === module) {
    dumpDatabase()
        .catch(console.error)
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = dumpDatabase;
