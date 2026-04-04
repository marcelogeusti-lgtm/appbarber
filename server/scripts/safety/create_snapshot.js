const fs = require('fs');
const path = require('path');

// Configuração
const rootDir = path.join(__dirname, '../../../');
const backupBaseDir = path.join(rootDir, 'backups/snapshots');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const targetDir = path.join(backupBaseDir, `snapshot-${timestamp}`);

// Itens para copiar (pastas principais)
const itemsToBackup = ['client', 'server', 'api'];
const excludedDirs = ['node_modules', '.next', '.vercel', 'dist', 'build', '.git'];

async function createSnapshot() {
    console.log(`[Snapshot] Iniciando backup para: ${targetDir}`);
    
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    for (const item of itemsToBackup) {
        const source = path.join(rootDir, item);
        const destination = path.join(targetDir, item);

        if (fs.existsSync(source)) {
            console.log(`[Snapshot] Copiando ${item}...`);
            try {
                // fs.cpSync disponível no Node 16.7.0+
                fs.cpSync(source, destination, { 
                    recursive: true, 
                    filter: (src) => {
                        return !excludedDirs.some(excluded => src.includes(path.sep + excluded) || src.endsWith(path.sep + excluded));
                    }
                });
            } catch (err) {
                console.error(`[Snapshot] Erro ao copiar ${item}:`, err.message);
            }
        }
    }

    // Copiar arquivos raiz (package.json, vercel.json, etc)
    const rootFiles = fs.readdirSync(rootDir).filter(f => {
        const fullPath = path.join(rootDir, f);
        return fs.statSync(fullPath).isFile() && !f.startsWith('.');
    });

    for (const file of rootFiles) {
        fs.copyFileSync(path.join(rootDir, file), path.join(targetDir, file));
    }

    fs.writeFileSync(path.join(rootDir, 'SUCCESS_SNAPSHOT.txt'), `Finalizado em: ${new Date().toLocaleString()}`);
    console.log(`[Snapshot] Finalizado com sucesso em: ${targetDir}`);
}

if (require.main === module) {
    createSnapshot().catch(console.error);
}

module.exports = createSnapshot;
