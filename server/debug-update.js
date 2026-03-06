const prisma = require('./src/lib/prisma');
async function run() {
    try {
        const phone = '21991164174';
        const rawPhone = '21991164174';
        console.log("Looking up phone:", rawPhone);

        const clients = await prisma.client.findMany({ where: { phone: { contains: '991164174' } } });
        console.log("Clients with similar phone:", clients.map(c => ({ id: c.id, name: c.name, phone: c.phone })));

        const email = 'marcelogeusti@gmail.com';
        const auth = await prisma.authUser.findUnique({ where: { email }, include: { client: true, user: true } });
        if (auth) {
            console.log("\nFound AuthUser for email:", email);
            console.log("Client object:", auth.client);
            if (auth.client) {
                console.log("\nTrying update simulation...");
                try {
                    const u = await prisma.client.update({
                        where: { id: auth.client.id },
                        data: {
                            name: 'Marcelo Geusti',
                            phone: rawPhone,
                            gender: null,
                            birthDate: null,
                        }
                    });
                    console.log("Update SUCCESS:", u);
                } catch (e) {
                    console.log("Update ERROR:", e.message, e.code);
                }
            }
        } else {
            console.log("AuthUser NOT FOUND for email", email);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0); // Exit process
    }
}
run();
