const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), subscriptionController.createPlan);
router.get('/', subscriptionController.getPlans);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), subscriptionController.deletePlan);

module.exports = router;
