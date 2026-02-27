const fs = require('fs');
const path = require('path');

const controllerPath = path.resolve(__dirname, 'src/controllers/fcmToken.controller.js');
const routesPath = path.resolve(__dirname, 'src/routes/fcmToken.routes.js');

console.log('--- PATH DIAGNOSTICS ---');
console.log('Current Dir:', __dirname);
console.log('Checking Controller:', controllerPath);
console.log('Exists?', fs.existsSync(controllerPath));
console.log('Checking Routes:', routesPath);
console.log('Exists?', fs.existsSync(routesPath));

if (fs.existsSync(routesPath)) {
    const content = fs.readFileSync(routesPath, 'utf8');
    console.log('Routes content (partial):', content.substring(0, 100));
}
