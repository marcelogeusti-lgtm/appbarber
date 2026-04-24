
const bus1 = require('./server/src/services/events/eventBus');
const bus2 = require('./server/src/controllers/../services/events/eventBus');
const bus3 = require('./server/src/services/notificationService/../events/eventBus');

console.log('Bus 1 === Bus 2:', bus1 === bus2);
console.log('Bus 2 === Bus 3:', bus2 === bus3);

bus1.on('test', () => console.log('Listener on Bus 1 received event'));
bus3.emit('test');

process.exit(0);
