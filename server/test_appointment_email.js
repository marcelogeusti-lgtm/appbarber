try {
    console.log('[Test] Loading EventBus...');
    const eventBus = require('./src/services/events/eventBus');

    console.log('[Test] Loading NotificationService...');
    const ns = require('./src/services/notificationService');
    ns.init();

    console.log('[Test] EventBus Listeners for APPOINTMENT_CREATED:', eventBus.listenerCount('APPOINTMENT_CREATED'));

    const mockPayload = {
        id: 'test-app-id',
        clientId: 'test-client-id',
        date: new Date(Date.now() + 86400000).toISOString(),
        client: {
            name: 'Cliente Teste',
            phone: '5511999999999',
            authUser: { email: 'marcelogeusti@gmail.com' }
        },
        service: { name: 'Corte de Cabelo Premium', price: 50.00 },
        professional: { name: 'Beto Barbeiro' },
        barbershop: { name: 'Corte & Conexão' },
        order: {
            total: 85.00,
            items: [
                { type: 'SERVICE', service: { name: 'Corte de Cabelo Premium' }, quantity: 1, total: 50.00 },
                { type: 'PRODUCT', product: { name: 'Pomada Modeladora' }, quantity: 1, total: 35.00 }
            ]
        }
    };

    console.log('[Test] Emitting APPOINTMENT_CREATED...');
    eventBus.emit('APPOINTMENT_CREATED', mockPayload);

    setTimeout(() => {
        console.log('[Test] Finished.');
        process.exit(0);
    }, 6000);
} catch (err) {
    console.error('[Test] CRITICAL ERROR:', err);
    process.exit(1);
}
