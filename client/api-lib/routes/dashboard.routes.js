const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Protect route to ensure user is logged in
// Allow ADMIN and BARBER roles (as per existing dashboard logic)
router.get('/stats', protect, authorize('SUPER_ADMIN', 'ADMIN', 'BARBER'), getDashboardStats);

module.exports = router;
