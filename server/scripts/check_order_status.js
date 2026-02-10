require('dotenv').config();
const axios = require('axios');

const ORDER_ID = process.argv[2]; // Pass ID as argument

if (!ORDER_ID) {
    console.error("Uso: node scripts/check_order_status.js <ORDER_ID>");
    process.exit(1);
}

async function checkOrder() {
    console.log(`=== Verificando Order: ${ORDER_ID} ===`);

    // Tenta pegar token do env
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
        console.error("Erro: MP_ACCESS_TOKEN não definido no .env");
        process.exit(1);
    }

    try {
        const response = await axios.get(`https://api.mercadopago.com/v1/orders/${ORDER_ID}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const order = response.data;
        console.log("\n--- Detalhes da Order ---");
        console.log(`ID: ${order.id}`);
        console.log(`Status: ${order.status}`);
        console.log(`Data Criação: ${order.date_created}`);
        console.log(`Total: ${order.total_amount} ${order.currency_id}`);

        if (order.transactions && order.transactions.payments) {
            console.log("\n--- Pagamentos ---");
            order.transactions.payments.forEach((p, index) => {
                console.log(`\nPagamento #${index + 1}:`);
                console.log(`  ID: ${p.id}`);
                console.log(`  Status: ${p.status}`);
                console.log(`  Detalhe: ${p.status_detail}`);
                console.log(`  Método: ${p.payment_method_id} (${p.payment_type})`);
            });
        }

    } catch (error) {
        console.error("Erro ao buscar Order:", error.response?.data || error.message);
    }
}

checkOrder();
