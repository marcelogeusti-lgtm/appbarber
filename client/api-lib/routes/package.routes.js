const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware.protect);


// Admin / Shop
router.post('/', packageController.createPackage);
router.get('/', packageController.getPackages); // ?barbershopId=...
router.post('/assign', packageController.assignPackageToClient);
router.post('/purchase', packageController.purchasePackage);

// Client View
router.get('/client/:clientId', packageController.getClientPackages);

module.exports = router;
