try {
    console.log("Checking imports...");
    require('./controllers/payment.controller');
    console.log("Success!");
} catch (err) {
    console.error("FAILED TO LOAD:");
    console.error(err);
}
