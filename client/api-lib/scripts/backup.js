const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configuration
const BACKUP_DIR = path.join(__dirname, '../../backups');
const DB_URL = process.env.DATABASE_URL;

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Executes a database backup using pg_dump
 * Requires PostgreSQL tools installed on the system
 */
function performBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    console.log(`[Backup] Starting backup to ${filename}...`);

    // Using pg_dump. DATABASE_URL should be in format postgres://user:password@host:port/db
    // This command assumes pg_dump is available in the system path.
    const command = `pg_dump "${DB_URL}" > "${filepath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`[Backup] Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`[Backup] Stderr: ${stderr}`);
        }

        console.log(`[Backup] Success! File saved at: ${filepath}`);

        // Retention: Delete backups older than 30 days
        cleanOldBackups();
    });
}

function cleanOldBackups() {
    const daysToKeep = 30;
    const now = Date.now();

    fs.readdirSync(BACKUP_DIR).forEach(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

        if (ageInDays > daysToKeep) {
            console.log(`[Backup] Removing old backup: ${file}`);
            fs.unlinkSync(filePath);
        }
    });
}

// Run if called directly
if (require.main === module) {
    performBackup();
}

module.exports = performBackup;
