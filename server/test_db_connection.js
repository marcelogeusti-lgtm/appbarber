const { Client } = require('pg');

const connectionString = 'postgresql://postgres:G%40usti8826%21@db.rcqcjyjbuutumnquonnf.supabase.co:5432/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        console.log('Tentando conectar ao banco de dados...');
        await client.connect();
        console.log('✅ Conexão bem-sucedida!');
        const res = await client.query('SELECT NOW()');
        console.log('Data/Hora do servidor:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('❌ Erro na conexão:', err.message);
        process.exit(1);
    }
}

testConnection();
