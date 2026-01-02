const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
// const authMiddleware = require('../middlewares/auth'); // Assuming we have auth

router.get('/', orderController.listOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrder);
router.post('/:id/items', orderController.addItem);
router.put('/:id/discount', orderController.updateDiscount);
router.delete('/items/:itemId', orderController.removeItem);
router.post('/:id/pay', orderController.closeOrder);

module.exports = router;
