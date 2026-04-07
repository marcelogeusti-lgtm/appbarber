const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), subscriptionController.createPlan);
router.get('/', subscriptionController.getPlans);
router.get('/my-active', protect, subscriptionController.getMyActiveSubscription);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), subscriptionController.deletePlan);
router.post('/purchase', protect, subscriptionController.purchasePlan);
router.post('/subscribe', protect, subscriptionController.subscribe);
router.post('/reset-all', protect, authorize('ADMIN', 'SUPER_ADMIN'), subscriptionController.triggerReset);
router.get('/list', protect, subscriptionController.getSubscribers);

module.exports = router;
