const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), productController.createProduct);
router.get('/', protect, productController.getProducts);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), productController.updateProduct);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), productController.deleteProduct);

module.exports = router;
