const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    console.log("--- EMERGENCY DATABASE DIAGNOSIS ---");
    try {
        // 1. List all tables in all schemas
        console.log("\n[1] LISTING ALL TABLES (ALL SCHEMAS):");
        const tables = await prisma.$queryRaw`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY table_schema, table_name;
        `;
        tables.forEach(t => console.log(`${t.table_schema}.${t.table_name}`));

        // 2. Count records in main tables (trying various names)
        console.log("\n[2] RECORD COUNTS (SEARCHING VARIOUS NAMES):");
        const tablesToTry = [
            'Barbershop', 'barbershops', 'barbershop',
            'Service', 'services', 'service',
            'Appointment', 'appointments', 'appointment',
            'Professional', 'professionals', 'professional',
            'User', 'users', 'user',
            'AuthUser', 'auth_users', 'auth_user',
            'Plan', 'plans', 'SubscriptionPlan'
        ];
        
        for (const tableName of tablesToTry) {
            // Find which schema has this table
            const schemaMatch = tables.find(t => t.table_name.toLowerCase() === tableName.toLowerCase());
            if (schemaMatch) {
                try {
                    const count = await prisma.$queryRawUnsafe(`SELECT count(*) as count FROM "${schemaMatch.table_schema}"."${schemaMatch.table_name}"`);
                    console.log(`[${schemaMatch.table_schema}].${schemaMatch.table_name}: ${count[0].count}`);
                } catch (e) {
                    console.log(`[${schemaMatch.table_schema}].${schemaMatch.table_name}: ERROR: ${e.message.split('\n')[0]}`);
                }
            }
        }

        // 3. Check for Prisma Migrations
        console.log("\n[3] PRISMA MIGRATIONS HISTORY:");
        try {
            const migrations = await prisma.$queryRaw`SELECT migration_name, applied_steps_count, finished_at FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 10`;
            console.table(migrations);
        } catch (e) {
            console.log("Migrations table not found or error:", e.message.split('\n')[0]);
        }

        // 3. Search for data by known content (e.g. user email)
        console.log("\n[3] SEARCHING DATA BY CONTENT (marcelogeusti@gmail.com):");
        const searchEmail = 'marcelogeusti@gmail.com';
        
        // Search in AuthUser
        const authUsers = await prisma.authUser.findMany({
            where: { email: searchEmail }
        });
        console.log(`AuthUser matches for ${searchEmail}:`, authUsers.length);
        if (authUsers.length > 0) {
            console.log("AuthUser found:", authUsers[0].id);
        }

        // Search in User
        const users = await prisma.user.findMany({
            where: { email: searchEmail }
        });
        console.log(`User matches for ${searchEmail}:`, users.length);
        if (users.length > 0) {
            console.log("User data:", JSON.stringify(users[0], null, 2));
        }

        // 4. Check for Barbershops
        const barbershops = await prisma.barbershop.findMany({
            include: { owner: true }
        });
        console.log("\n[4] REMAINING BARBERSHOPS:");
        if (barbershops.length === 0) {
            console.log("!!! NO BARBERSHOPS FOUND !!!");
        } else {
            barbershops.forEach(b => {
                console.log(`- ${b.name} (Slug: ${b.slug}) - ID: ${b.id} - Owner: ${b.owner?.email}`);
            });
        }

        // 5. Check for Users
        const allUsers = await prisma.user.findMany();
        console.log("\n[5] REMAINING USERS:");
        allUsers.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`));

    } catch (err) {
        console.error("DIAGNOSIS FAILED:", err);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
