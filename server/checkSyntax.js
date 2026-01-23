try {
    require('./src/controllers/professional.controller.js');
    console.log('✅ Professional Controller is valid');
} catch (err) {
    console.error('❌ Professional Controller has ERRORS:', err.message);
    console.error(err.stack);
}
