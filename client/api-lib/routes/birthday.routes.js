const express = require('express');
const router = express.Router();
const c = require('../controllers/birthday.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN', 'BARBER', 'RECEPTIONIST'), c.report);
router.post('/send', protect, authorize('ADMIN', 'SUPER_ADMIN'), c.sendGreeting);

module.exports = router;
