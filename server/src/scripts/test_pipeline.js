
require('dotenv').config();
const eventBus = require('./server/src/services/events/eventBus');

// Import NotificationService to trigger its top-level listeners
console.log('Importing NotificationService...');
require('./server/src/services/notificationService');

console.log('Emitting DIAGNOSTIC_PING...');
eventBus.emit('DIAGNOSTIC_PING');

// Test fake appointment
const mockApp = {
    id: 'test-diagnostic-id',
    date: new Date().toISOString(),
    client: { name: 'Test Diagnostic', phone: '21991164174', email: 'marcelogeusti@gmail.com' },
    barbershop: { name: 'Diagnostic Shop' },
    service: { name: 'Corte de Teste' },
    professional: { name: 'Dr. Diagnostic' },
    professionalId: 'ff550352-540a-4fd4-a1a5-55cb7c61a54f', // Real pro ID for testing if possible
    barbershopId: 'b4b6f441-bc91-49b9-b9d2-0782c48d458c'
};

console.log('Emitting APPOINTMENT_CREATED for mock appointment...');
eventBus.emit('APPOINTMENT_CREATED', mockApp);

setTimeout(() => {
    console.log('Test complete. Check logs above for PONG and Receipt confirmation.');
    process.exit(0);
}, 3000);
