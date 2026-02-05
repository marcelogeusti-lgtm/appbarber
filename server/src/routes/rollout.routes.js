const express = require('express');
const router = express.Router();
const rolloutController = require('../controllers/rollout.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Protect all rollout routes for SUPER_ADMIN only
router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('SUPER_ADMIN'));

router.get('/flags', rolloutController.getFlags);
router.post('/toggle', rolloutController.toggleFlag);
router.post('/global-rollout', rolloutController.rolloutGlobally);

module.exports = router;
