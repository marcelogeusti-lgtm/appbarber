const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gateway.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// GET /api/gateways - List all configs (masked)
router.get('/', protect, authorize('admin', 'owner', 'barber'), gatewayController.getConfigs);

// POST /api/gateways - Create/Update config
router.post('/', protect, authorize('admin', 'owner', 'barber'), gatewayController.saveConfig);

module.exports = router;
