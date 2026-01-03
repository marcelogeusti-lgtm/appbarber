const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

// Public or Client routes might need protection but checkSubscription allows CLIENT role
// Applying globally for safety, assuming protect handles auth
router.use(protect);
router.use(checkSubscription);

router.get('/', orderController.listOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrder);
router.post('/:id/items', orderController.addItem);
router.put('/:id/discount', orderController.updateDiscount);
router.delete('/items/:itemId', orderController.removeItem);
router.post('/:id/pay', orderController.closeOrder);

module.exports = router;
