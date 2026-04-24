
require('dotenv').config();
const path = require('path');

const root = process.cwd();
const eventBusPath = path.join(root, 'server/src/services/events/eventBus');
const notificationServicePath = path.join(root, 'server/src/services/notificationService');

const eventBus = require(eventBusPath);

console.log('Importing NotificationService...');
require(notificationServicePath);

console.log('Emitting DIAGNOSTIC_PING...');
eventBus.emit('DIAGNOSTIC_PING');

const mockApp = {
    id: 'test-diagnostic-id',
    date: new Date().toISOString(),
    client: { name: 'Test Diagnostic', phone: '21991164174', email: 'marcelogeusti@gmail.com' },
    barbershop: { name: 'Diagnostic Shop' },
    service: { name: 'Corte de Teste' },
    professional: { name: 'Dr. Diagnostic' },
    professionalId: 'ff550352-540a-4fd4-a1a5-55cb7c61a54f',
    barbershopId: 'b4b6f441-bc91-49b9-b9d2-0782c48d458c'
};

console.log('Emitting APPOINTMENT_CREATED...');
eventBus.emit('APPOINTMENT_CREATED', mockApp);

setTimeout(() => {
    console.log('Test complete.');
    process.exit(0);
}, 3000);
