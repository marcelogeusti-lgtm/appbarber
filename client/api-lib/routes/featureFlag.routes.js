const express = require('express');
const router = express.Router();
const featureFlagController = require('../controllers/featureFlag.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// Get flags (scoped to tenant or all if super_admin)
router.get('/', featureFlagController.getFlags);

// Check specific flag
router.get('/:key', featureFlagController.checkFlag);

// Update/Create flag (Admin or Super Admin only)
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), featureFlagController.updateFlag);

module.exports = router;
