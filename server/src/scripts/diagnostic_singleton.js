
const path = require('path');
const fs = require('fs');

// Resolve absolute paths
const root = process.cwd();
const busPath1 = path.join(root, 'server/src/services/events/eventBus.js');
const busPath2 = path.join(root, 'server/src/controllers/../services/events/eventBus.js');
const busPath3 = path.join(root, 'server/src/services/notificationService/../events/eventBus.js');

console.log('Path 1:', busPath1);
console.log('Path 2:', busPath2);
console.log('Path 3:', busPath3);

const bus1 = require(busPath1);
const bus2 = require(busPath2);
const bus3 = require(busPath3);

console.log('Bus 1 === Bus 2:', bus1 === bus2);
console.log('Bus 2 === Bus 3:', bus2 === bus3);

if (bus1 === bus2 && bus2 === bus3) {
    console.log('✅ Singleton verified across all paths.');
} else {
    console.log('❌ Singleton FAILED! Different instances detected.');
}

process.exit(0);
