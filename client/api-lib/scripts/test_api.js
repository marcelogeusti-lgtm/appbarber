const { getMyBarbershop } = require('../controllers/barbershop.controller');
const prisma = require('../lib/prisma');

async function test() {
    const req = {
        user: {
            id: 'ff550352-540a-4fd4-a1a5-55cb7c61a54f', // Marcelo Geusti
            role: 'SUPER_ADMIN'
        }
    };

    const res = {
        json: (data) => {
            console.log('--- GET ME SHOP RESPONSE ---');
            console.log(JSON.stringify(data, null, 2));
            process.exit(0);
        },
        status: (code) => ({
            json: (data) => {
                console.error(`--- ERROR RESPONSE (${code}) ---`);
                console.error(data);
                process.exit(code);
            }
        })
    };

    try {
        await getMyBarbershop(req, res);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
test();
