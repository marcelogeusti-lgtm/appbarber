const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), checkSubscription, productController.createProduct);
router.get('/', protect, productController.getProducts);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, productController.updateProduct);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, productController.deleteProduct);

module.exports = router;
