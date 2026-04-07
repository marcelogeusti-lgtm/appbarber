const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlist.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/', waitlistController.addToWaitlist); // Public (Guests/Clients)
router.get('/', protect, authorize('ADMIN', 'BARBER', 'SUPER_ADMIN'), waitlistController.getWaitlist);
router.delete('/:id', protect, authorize('ADMIN', 'BARBER', 'SUPER_ADMIN'), waitlistController.removeFromWaitlist);

module.exports = router;
