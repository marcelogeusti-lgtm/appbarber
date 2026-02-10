
try {
    console.log('Attempting to require payment.controller...');
    const pc = require('../controllers/payment.controller');
    console.log('Controller loaded successfully');
} catch (e) {
    console.error('Error loading controller:', e);
}
